// --- グローバル変数 ---
let currentLangData = {};

// --- 主要関数 ---

/**
 * 内部処理用のメイン言語設定関数。DOMの更新とテキストの適用を行う。
 * @param {string} lang - 言語コード (例: 'ja', 'en')
 */
async function loadAndApplyLanguage(lang) {
    localStorage.setItem('lang', lang); 

    try {
        const response = await fetch(`locales/${lang}.json`);
        if (!response.ok) {
            console.error(`Language file for "${lang}" not found.`);
            return;
        }
        currentLangData = await response.json();

        // UIテキストを更新
        document.querySelectorAll('[data-key]').forEach(element => {
            const key = element.getAttribute('data-key');
            if (currentLangData.ui && currentLangData.ui[key]) {
                element.innerHTML = currentLangData.ui[key];
            }
        });

        document.title = currentLangData.ui?.site_title || 'Soul Grimoire';
        document.documentElement.lang = lang;

    } catch (error) {
        console.error('Error loading language data:', error);
    }
}

/**
 * 診断ページのフォーム操作を処理する関数
 */
function handleDiagnosisForm() {
    const form = document.getElementById('diagnosis-form');
    if (!form) return;

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const q1 = form.q1?.value;
        const q2 = form.q2?.value;
        const q3 = form.q3?.value;
        const q4 = form.q4?.value;
        const currentLang = localStorage.getItem('lang') || 'en';

        if (q1 && q2 && q3 && q4) {
            const resultId = `${q1}-${q2}-${q3}-${q4}`;
            window.location.href = `result.html?id=${resultId}&lang=${currentLang}`;
        } else {
            alert(currentLangData.ui?.diagnosis_alert || '全ての問いに答えてください。');
        }
    });
}

/**
 * 結果ページの表示を処理する関数
 */
function displayResult() {
    if (!currentLangData.results) return; // データがなければ何もしない

    const params = new URLSearchParams(window.location.search);
    const resultId = params.get('id');

    if (!resultId) {
        document.getElementById('result-content').innerHTML = `<h1>Error</h1><p>Result ID not found.</p>`;
        return;
    }
    
    const result = currentLangData.results[resultId];

    if (result) {
        // ... (以前と同様の結果表示コード)
        document.getElementById('archetype').textContent = result.core_type;
        document.getElementById('archetype-details').textContent = `${result.element} : ${result.keyword}`;
        document.getElementById('symbol-image').src = `assets/images/placeholder.png`;
        document.getElementById('symbol-image').alt = result.symbol_name;
        document.getElementById('symbol-name').textContent = result.symbol_name;
        document.getElementById('overview').textContent = result.overview;
        document.getElementById('chapter1-text').textContent = result.chapter1;
        document.getElementById('chapter2-text').textContent = result.chapter2;
        document.getElementById('chapter3-text').textContent = result.chapter3;
        document.getElementById('chapter4-text').textContent = result.chapter4;
    } else {
        document.getElementById('result-content').innerHTML = `<h1>Result Not Found</h1>`;
    }
}

/**
 * HTMLのボタンから呼び出される、安全な言語切替関数
 * @param {string} lang - 'ja' or 'en'
 */
window.changeLanguage = async (lang) => {
    await loadAndApplyLanguage(lang);
    // 結果ページの場合、言語変更後にテキストを再表示
    if (document.getElementById('result-content')) {
        displayResult();
    }
};


// --- 初期化処理 ---

/**
 * ページが読み込まれたときに最初に実行されるメインの関数
 */
async function initializePage() {
    const urlParams = new URLSearchParams(window.location.search);
    const langFromUrl = urlParams.get('lang');
    const langFromStorage = localStorage.getItem('lang');
    const langFromBrowser = navigator.language.split('-')[0];
    const initialLang = langFromUrl || langFromStorage || (langFromBrowser === 'ja' ? 'ja' : 'en');
    
    await loadAndApplyLanguage(initialLang);
    
    if (document.getElementById('diagnosis-form')) { handleDiagnosisForm(); }
    if (document.getElementById('result-content')) { displayResult(); }
    
    if (document.getElementById('particles-js') && typeof particlesJS === 'function') {
        particlesJS('particles-js', { /* ... パーティクルの設定 ... */ });
    }
}

document.addEventListener('DOMContentLoaded', initializePage);