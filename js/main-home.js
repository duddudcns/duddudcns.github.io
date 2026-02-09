document.addEventListener('DOMContentLoaded', async () => {
    const authStateText = document.getElementById('authStateText');
    const loginBtn = document.getElementById('googleLoginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const gameSelect = document.getElementById('leaderboardGameSelect');
    const refreshBtn = document.getElementById('refreshLeaderboardBtn');
    const boardBody = document.getElementById('leaderboardBody');

    if (!window.AuthLeaderboard) return;

    await window.AuthLeaderboard.init();

    const renderAuth = (user) => {
        if (!authStateText) return;
        if (user) {
            authStateText.innerText = `${user.displayName || 'Player'} (${user.email || user.uid})`;
            logoutBtn.style.display = 'inline-block';
        } else {
            authStateText.innerText = window.AppI18n ? window.AppI18n.t('auth.loggedOut', '로그인 안됨') : '로그인 안됨';
            logoutBtn.style.display = 'none';
        }
    };

    const renderRows = (rows) => {
        boardBody.innerHTML = '';
        if (!rows.length) {
            boardBody.innerHTML = '<tr><td colspan="3">랭킹 데이터 없음</td></tr>';
            return;
        }
        rows.forEach((row, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${idx + 1}</td><td>${row.displayName || 'Player'}</td><td>${Number(row.bestScore || 0)}</td>`;
            boardBody.appendChild(tr);
        });
    };

    const refreshLeaderboard = async () => {
        const gameId = gameSelect.value;
        const rows = await window.AuthLeaderboard.fetchTopScores(gameId, 20);
        renderRows(rows);
    };

    loginBtn.addEventListener('click', async () => {
        try {
            await window.AuthLeaderboard.signIn();
            await refreshLeaderboard();
        } catch (err) {
            alert(`로그인 실패: ${err.message}`);
        }
    });

    logoutBtn.addEventListener('click', async () => {
        await window.AuthLeaderboard.signOut();
        await refreshLeaderboard();
    });

    refreshBtn.addEventListener('click', refreshLeaderboard);
    gameSelect.addEventListener('change', refreshLeaderboard);

    window.AuthLeaderboard.onAuthChanged(renderAuth);
    await refreshLeaderboard();
});
