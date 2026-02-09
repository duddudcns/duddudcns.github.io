document.addEventListener('DOMContentLoaded', async () => {
    if (!window.AuthLeaderboard) return;

    const statusEl = document.getElementById('menuAuthStatus');
    const loginBtn = document.getElementById('menuGoogleLoginBtn');
    const logoutBtn = document.getElementById('menuLogoutBtn');
    if (!statusEl || !loginBtn || !logoutBtn) return;

    await window.AuthLeaderboard.init();

    const render = (user) => {
        if (user) {
            statusEl.innerText = user.displayName || user.email || user.uid;
            logoutBtn.style.display = 'inline-block';
        } else {
            statusEl.innerText = window.AppI18n ? window.AppI18n.t('auth.loggedOut', '로그인 안됨') : '로그인 안됨';
            logoutBtn.style.display = 'none';
        }
    };

    loginBtn.addEventListener('click', async () => {
        try {
            await window.AuthLeaderboard.signIn();
        } catch (err) {
            alert(`로그인 실패: ${err.message}`);
        }
    });

    logoutBtn.addEventListener('click', async () => {
        await window.AuthLeaderboard.signOut();
    });

    window.AuthLeaderboard.onAuthChanged(render);
});
