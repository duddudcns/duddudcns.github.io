document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const nextCanvas = document.getElementById('nextCanvas');

    // 싱글톤 패턴처럼 하나의 게임 엔진 생성
    window.game = new GameEngine(canvas, nextCanvas);

    // 게임 시작
    window.game.start();

    setupMobileControls();
    setupResponsiveCanvas();
});

function setupMobileControls() {
    const upBtn = document.getElementById('mobileUpBtn');
    const leftBtn = document.getElementById('mobileLeftBtn');
    const rightBtn = document.getElementById('mobileRightBtn');
    const downBtn = document.getElementById('mobileDownBtn');
    const spaceBtn = document.getElementById('mobileSpaceBtn');

    if (!upBtn || !leftBtn || !rightBtn || !downBtn || !spaceBtn) return;

    const triggerKeyDown = (keyValue) => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: keyValue, bubbles: true }));
    };

    const triggerKeyUp = (keyValue) => {
        window.dispatchEvent(new KeyboardEvent('keyup', { key: keyValue, bubbles: true }));
    };

    const bindHoldButton = (button, keyValue) => {
        const release = (event) => {
            event.preventDefault();
            triggerKeyUp(keyValue);
        };

        button.addEventListener('pointerdown', (event) => {
            event.preventDefault();
            triggerKeyDown(keyValue);
        });

        button.addEventListener('pointerup', release);
        button.addEventListener('pointercancel', release);
        button.addEventListener('pointerleave', release);
    };

    const bindTapButton = (button, keyValue) => {
        button.addEventListener('pointerdown', (event) => {
            event.preventDefault();
            triggerKeyDown(keyValue);
        });

        const release = (event) => {
            event.preventDefault();
            triggerKeyUp(keyValue);
        };

        button.addEventListener('pointerup', release);
        button.addEventListener('pointercancel', release);
        button.addEventListener('pointerleave', release);
    };

    bindTapButton(upBtn, 'ArrowUp');
    bindHoldButton(leftBtn, 'ArrowLeft');
    bindHoldButton(rightBtn, 'ArrowRight');
    bindHoldButton(downBtn, 'ArrowDown');

    spaceBtn.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        triggerKeyDown(' ');
    });

    const releaseSpace = (event) => {
        event.preventDefault();
        triggerKeyUp(' ');
    };

    spaceBtn.addEventListener('pointerup', releaseSpace);
    spaceBtn.addEventListener('pointercancel', releaseSpace);
    spaceBtn.addEventListener('pointerleave', releaseSpace);

    window.addEventListener('blur', () => {
        triggerKeyUp('ArrowUp');
        triggerKeyUp('ArrowLeft');
        triggerKeyUp('ArrowRight');
        triggerKeyUp('ArrowDown');
        triggerKeyUp(' ');
    });
}

function setupResponsiveCanvas() {
    const wrapper = document.querySelector('.game-wrapper');
    if (!wrapper) return;

    const baseWidth = wrapper.offsetWidth;
    const baseHeight = wrapper.offsetHeight;

    const applyWrapperScale = () => {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const outerMargin = 10; // 5px each side

        const scale = Math.min(
            (viewportWidth - outerMargin) / baseWidth,
            (viewportHeight - outerMargin) / baseHeight
        );
        wrapper.style.transform = `scale(${scale})`;
    };

    let rafId = null;
    const scheduleScale = () => {
        if (rafId !== null) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
            applyWrapperScale();
            rafId = null;
        });
    };

    window.addEventListener('resize', scheduleScale);
    window.addEventListener('orientationchange', scheduleScale);
    window.addEventListener('load', scheduleScale);

    scheduleScale();
}

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
