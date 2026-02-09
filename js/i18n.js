(function () {
    const STORAGE_KEY = 'site_language';
    const DEFAULT_LANGUAGE = 'ko';

    const translations = {
        ko: {
            'lang.label': '언어',

            'home.title': '미니게임천국',
            'home.subtitle': 'MINIGAME HEAVEN',
            'home.runrun.name': '달려달려',
            'home.runrun.desc': '장애물 피하기의 전설',
            'home.tetris.name': '테트리스',
            'home.tetris.desc': '클래식 퍼즐의 정석',
            'home.swing.name': '놓아놓아',
            'home.swing.desc': '스파이더맨 줄타기',
            'home.fps.name': 'FPS 슈팅',
            'home.fps.desc': '3D 타겟 사격',
            'home.breakout.name': '벽돌깨기',
            'home.breakout.desc': '공으로 벽돌을 부숴라',
            'home.start': 'START',
            'home.footer': '© 2026 Minigame Heaven. All rights reserved.',

            'common.home': '🏠 홈으로',
            'common.restart': '재시작',
            'common.controls': '조작방법',
            'common.pause': '일시정지',
            'common.resume': '재개하기',
            'common.close': '닫기',
            'common.account': '계정',
            'auth.loginGoogle': 'Google 로그인',
            'auth.logout': '로그아웃',
            'auth.loggedOut': '로그인 안됨',

            'tetris.next': '다음 블록들',
            'tetris.bestScore': '최고 점수',
            'tetris.currentScore': '현재 점수',
            'tetris.level': '레벨',
            'tetris.dropSpeed': '낙하 속도',
            'tetris.controls.leftRightDown': '방향키 : 이동 / 하강',
            'tetris.controls.rotate': 'W / ↑ : 회전',
            'tetris.controls.hardDrop': 'Space : 즉시 하강',
            'tetris.controls.pause': 'P : 일시정지',
            'tetris.gameOver': '게임 종료',
            'tetris.finalScore': '최종 점수',
            'tetris.bestRecord': '최고 기록',
            'tetris.retry': '다시 시작',
            'tetris.releaseNotes': '🚀 릴리즈 노트',

            'runrun.score': '현재 점수',
            'runrun.fever': '피버 게이지',
            'runrun.control.jump': '아무 키나 클릭 : 점프',
            'runrun.control.jump2': '(공중에서 한 번 더 가능)',
            'runrun.clear': '기록 달성!',
            'runrun.finalScore': '최종 점수',
            'runrun.retry': '다시 달리기',
            'runrun.ready': 'READY?',
            'runrun.touchToStart': 'TOUCH TO START',
            'runrun.gameOver': 'GAME OVER',

            'swing.distance': '거리',
            'swing.control.tap': '클릭: 줄 쏘기/놓기',
            'swing.control.timing': '타이밍 맞춰 스윙!',
            'swing.fall': '추락!',
            'swing.finalDistance': '최종 거리',
            'swing.retry': '다시 스윙',
            'swing.touchToStart': 'TOUCH TO START',

            'breakout.score': '점수',
            'breakout.lives': '목숨',
            'breakout.level': '레벨',
            'breakout.control.move': '← / → : 패들 이동',
            'breakout.control.launch': 'Space : 공 발사',
            'breakout.control.mouse': '마우스/터치 : 패들 이동',
            'breakout.finalScore': '최종 점수',
            'breakout.retry': '다시 시작',
            'breakout.ready': 'READY?',
            'breakout.touchToStart': 'TOUCH TO START',
            'breakout.gameOver': '게임 오버',

            'fps.title': '🔫 FPS 슈팅',
            'fps.help.move': 'WASD: 이동',
            'fps.help.aim': '마우스: 조준',
            'fps.help.fire': '좌클릭: 발사 (실탄 발사!)',
            'fps.help.reload': 'R: 재장전, ESC: 일시정지',
            'fps.hud.ammo': '탄약',
            'fps.hud.kills': '처치',
            'fps.hud.score': '점수',
            'fps.start': '게임 시작',
            'fps.resume': '계속하기',
            'fps.home': '홈으로',
            'fps.pauseTitle': '일시정지',
            'fps.pauseHelp': '계속하려면 화면을 클릭하거나 버튼을 누르세요.',
            'fps.gameOver': '게임 오버',
            'fps.finalResult': '최종 점수: {score}<br>처치 수: {kills}',
            'fps.retry': '다시 하기'
        },
        en: {
            'lang.label': 'Language',

            'home.title': 'Minigame Heaven',
            'home.subtitle': 'MINIGAME HEAVEN',
            'home.runrun.name': 'Run Run',
            'home.runrun.desc': 'Legend of obstacle dodging',
            'home.tetris.name': 'Tetris',
            'home.tetris.desc': 'The classic puzzle standard',
            'home.swing.name': 'Swing Swing',
            'home.swing.desc': 'Spider-style rope action',
            'home.fps.name': 'FPS Shooting',
            'home.fps.desc': '3D target practice',
            'home.breakout.name': 'Breakout',
            'home.breakout.desc': 'Break every brick with the ball',
            'home.start': 'START',
            'home.footer': '© 2026 Minigame Heaven. All rights reserved.',

            'common.home': '🏠 Home',
            'common.restart': 'Restart',
            'common.controls': 'Controls',
            'common.pause': 'Pause',
            'common.resume': 'Resume',
            'common.close': 'Close',
            'common.account': 'Account',
            'auth.loginGoogle': 'Google Sign In',
            'auth.logout': 'Sign Out',
            'auth.loggedOut': 'Not signed in',

            'tetris.next': 'Next Blocks',
            'tetris.bestScore': 'Best Score',
            'tetris.currentScore': 'Score',
            'tetris.level': 'Level',
            'tetris.dropSpeed': 'Drop Speed',
            'tetris.controls.leftRightDown': 'Arrow Keys: Move / Soft Drop',
            'tetris.controls.rotate': 'W / ↑: Rotate',
            'tetris.controls.hardDrop': 'Space: Hard Drop',
            'tetris.controls.pause': 'P: Pause',
            'tetris.gameOver': 'Game Over',
            'tetris.finalScore': 'Final Score',
            'tetris.bestRecord': 'Best Record',
            'tetris.retry': 'Play Again',
            'tetris.releaseNotes': '🚀 Release Notes',

            'runrun.score': 'Score',
            'runrun.fever': 'Fever Gauge',
            'runrun.control.jump': 'Any key/click: Jump',
            'runrun.control.jump2': '(One extra jump in air)',
            'runrun.clear': 'New Record!',
            'runrun.finalScore': 'Final Score',
            'runrun.retry': 'Run Again',
            'runrun.ready': 'READY?',
            'runrun.touchToStart': 'TOUCH TO START',
            'runrun.gameOver': 'GAME OVER',

            'swing.distance': 'Distance',
            'swing.control.tap': 'Click: Shoot/Release Rope',
            'swing.control.timing': 'Swing with timing!',
            'swing.fall': 'You Fell!',
            'swing.finalDistance': 'Final Distance',
            'swing.retry': 'Swing Again',
            'swing.touchToStart': 'TOUCH TO START',

            'breakout.score': 'Score',
            'breakout.lives': 'Lives',
            'breakout.level': 'Level',
            'breakout.control.move': '← / →: Move Paddle',
            'breakout.control.launch': 'Space: Launch Ball',
            'breakout.control.mouse': 'Mouse/Touch: Move Paddle',
            'breakout.finalScore': 'Final Score',
            'breakout.retry': 'Play Again',
            'breakout.ready': 'READY?',
            'breakout.touchToStart': 'TOUCH TO START',
            'breakout.gameOver': 'Game Over',

            'fps.title': '🔫 FPS Shooting',
            'fps.help.move': 'WASD: Move',
            'fps.help.aim': 'Mouse: Aim',
            'fps.help.fire': 'Left Click: Shoot',
            'fps.help.reload': 'R: Reload, ESC: Pause',
            'fps.hud.ammo': 'Ammo',
            'fps.hud.kills': 'Kills',
            'fps.hud.score': 'Score',
            'fps.start': 'Start Game',
            'fps.resume': 'Resume',
            'fps.home': 'Home',
            'fps.pauseTitle': 'Paused',
            'fps.pauseHelp': 'Click the screen or press the button to continue.',
            'fps.gameOver': 'Game Over',
            'fps.finalResult': 'Final Score: {score}<br>Kills: {kills}',
            'fps.retry': 'Retry'
        }
    };

    function getSavedLanguage() {
        const saved = localStorage.getItem(STORAGE_KEY);
        return translations[saved] ? saved : DEFAULT_LANGUAGE;
    }

    let currentLanguage = getSavedLanguage();
    document.documentElement.lang = currentLanguage;

    function format(template, vars) {
        if (!vars) return template;
        return Object.keys(vars).reduce((acc, key) => acc.replaceAll(`{${key}}`, String(vars[key])), template);
    }

    function t(key, fallback = '', vars) {
        const pack = translations[currentLanguage] || {};
        const value = pack[key] || fallback || key;
        return format(value, vars);
    }

    function applyTranslations(root = document) {
        root.querySelectorAll('[data-i18n]').forEach((el) => {
            const key = el.getAttribute('data-i18n');
            const fallback = el.getAttribute('data-i18n-fallback') || el.textContent.trim();
            el.textContent = t(key, fallback);
        });

        root.querySelectorAll('[data-i18n-html]').forEach((el) => {
            const key = el.getAttribute('data-i18n-html');
            const fallback = el.getAttribute('data-i18n-fallback') || el.innerHTML.trim();
            el.innerHTML = t(key, fallback);
        });

        root.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
            const key = el.getAttribute('data-i18n-aria-label');
            const fallback = el.getAttribute('aria-label') || '';
            el.setAttribute('aria-label', t(key, fallback));
        });
    }

    function syncSelectors() {
        document.querySelectorAll('[data-language-select]').forEach((select) => {
            select.value = currentLanguage;
        });
    }

    function setLanguage(language) {
        if (!translations[language]) return;
        currentLanguage = language;
        localStorage.setItem(STORAGE_KEY, language);
        document.documentElement.lang = language;
        syncSelectors();
        applyTranslations();
        window.dispatchEvent(new CustomEvent('app:language-changed', { detail: { language } }));
    }

    function bindLanguageSelectors() {
        document.querySelectorAll('[data-language-select]').forEach((select) => {
            select.value = currentLanguage;
            select.addEventListener('change', (event) => {
                setLanguage(event.target.value);
            });
        });
    }

    window.AppI18n = {
        t,
        setLanguage,
        getLanguage: () => currentLanguage,
        applyTranslations
    };

    const init = () => {
        bindLanguageSelectors();
        setLanguage(currentLanguage);
        document.documentElement.classList.remove('i18n-pending');
        document.documentElement.classList.add('i18n-ready');
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
