document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const nextCanvas = document.getElementById('nextCanvas');

    // 싱글톤 패턴처럼 하나의 게임 엔진 생성
    window.game = new GameEngine(canvas, nextCanvas);

    // 게임 시작
    window.game.start();
});

// 전역 스코프 함수들 (HTML의 onclick 등을 위함)
function togglePause() {
    if (window.game) window.game.togglePause();
}

function resetGame() {
    if (window.game) window.game.resetGame();
}

function showReleaseNotes() {
    document.getElementById('releaseNotesModal').style.display = 'flex';
}

function closeReleaseNotes() {
    document.getElementById('releaseNotesModal').style.display = 'none';
}
