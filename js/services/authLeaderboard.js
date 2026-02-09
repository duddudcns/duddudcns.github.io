(function () {
    const GAME_IDS = ['runrun', 'tetris', 'noahnohah', 'fps', 'breakout'];

    let app = null;
    let auth = null;
    let db = null;
    let initialized = false;
    let currentUser = null;
    const listeners = new Set();
    let authReadyResolved = false;
    let resolveAuthReady = null;
    const authReadyPromise = new Promise((resolve) => {
        resolveAuthReady = resolve;
    });

    function hasFirebase() {
        return typeof window.firebase !== 'undefined' && !!window.FIREBASE_CONFIG;
    }

    function emitAuthChanged() {
        listeners.forEach((fn) => {
            try {
                fn(currentUser);
            } catch (_) { }
        });
    }

    function notify(message) {
        if (window.console) console.log('[authLeaderboard]', message);
    }

    async function init() {
        if (initialized) return true;
        if (!hasFirebase()) {
            notify('Firebase config/sdk not found. Feature disabled.');
            return false;
        }

        app = firebase.initializeApp(window.FIREBASE_CONFIG);
        auth = firebase.auth();
        db = firebase.firestore();

        auth.onAuthStateChanged(async (user) => {
            currentUser = user || null;
            if (user) {
                await upsertUserProfile(user);
            }
            if (!authReadyResolved && resolveAuthReady) {
                authReadyResolved = true;
                resolveAuthReady(true);
            }
            emitAuthChanged();
        });

        initialized = true;
        return true;
    }

    async function signIn() {
        if (!(await init())) return null;
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await auth.signInWithPopup(provider);
        return result.user;
    }

    async function signOut() {
        if (!auth) return;
        await auth.signOut();
    }

    function getCurrentUser() {
        return currentUser;
    }

    async function upsertUserProfile(user) {
        if (!db || !user) return;
        const ref = db.collection('users').doc(user.uid);
        const now = firebase.firestore.FieldValue.serverTimestamp();
        await ref.set({
            uid: user.uid,
            displayName: user.displayName || 'Player',
            photoURL: user.photoURL || '',
            lastLoginAt: now,
            createdAt: now
        }, { merge: true });
    }

    function scoreDocRef(gameId, uid) {
        return db.collection('leaderboards').doc(gameId).collection('scores').doc(uid);
    }

    async function saveBestScore(gameId, bestScore) {
        if (!GAME_IDS.includes(gameId)) return false;
        if (!Number.isFinite(bestScore)) return false;
        if (!(await init())) return false;
        await authReadyPromise;
        if (!currentUser && auth && auth.currentUser) currentUser = auth.currentUser;
        if (!currentUser) {
            notify(`saveBestScore skipped: no authenticated user (game=${gameId})`);
            return false;
        }

        const uid = currentUser.uid;
        const ref = scoreDocRef(gameId, uid);
        const now = firebase.firestore.FieldValue.serverTimestamp();

        try {
            await db.runTransaction(async (tx) => {
                const snap = await tx.get(ref);
                if (!snap.exists) {
                    tx.set(ref, {
                        uid,
                        displayName: currentUser.displayName || 'Player',
                        photoURL: currentUser.photoURL || '',
                        bestScore,
                        updatedAt: now
                    });
                    return;
                }

                const prev = snap.data();
                const prevScore = Number(prev.bestScore || 0);
                if (bestScore >= prevScore) {
                    tx.update(ref, {
                        bestScore,
                        displayName: currentUser.displayName || prev.displayName || 'Player',
                        photoURL: currentUser.photoURL || prev.photoURL || '',
                        updatedAt: now
                    });
                }
            });
        } catch (err) {
            notify(`saveBestScore failed (${gameId}): ${err.code || ''} ${err.message || err}`);
            throw err;
        }

        return true;
    }

    async function fetchTopScores(gameId, limitCount = 10) {
        if (!(await init())) return [];
        const snap = await db
            .collection('leaderboards')
            .doc(gameId)
            .collection('scores')
            .orderBy('bestScore', 'desc')
            .limit(limitCount)
            .get();
        return snap.docs.map((doc) => doc.data());
    }

    function onAuthChanged(fn) {
        listeners.add(fn);
        fn(currentUser);
        return () => listeners.delete(fn);
    }

    window.AuthLeaderboard = {
        init,
        signIn,
        signOut,
        getCurrentUser,
        saveBestScore,
        fetchTopScores,
        onAuthChanged
    };
})();
