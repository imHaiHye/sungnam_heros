// Loving phrases a husband can say in his wife's first language.
// `hangul` is a pronunciation guide for Korean readers, `roman` for everyone else.
// `speech` is the BCP 47 tag passed to the Web Speech API.

export const PHRASE_KEYS = ['love', 'thanks', 'pretty'];

export const WIFE_LANGUAGES = [
    {
        code: 'vi',
        speech: 'vi-VN',
        phrases: {
            love: { text: 'Anh yêu em', roman: '', hangul: '아잉 이에우 앰' },
            thanks: { text: 'Cảm ơn em', roman: '', hangul: '깜 언 앰' },
            pretty: { text: 'Em đẹp lắm', roman: '', hangul: '앰 뎁 람' },
        },
    },
    {
        code: 'zh',
        speech: 'zh-CN',
        phrases: {
            love: { text: '我爱你', roman: 'wǒ ài nǐ', hangul: '워 아이 니' },
            thanks: { text: '谢谢你', roman: 'xièxie nǐ', hangul: '시에시에 니' },
            pretty: { text: '你真漂亮', roman: 'nǐ zhēn piàoliang', hangul: '니 전 퍄오량' },
        },
    },
    {
        code: 'fil',
        speech: 'fil-PH',
        phrases: {
            love: { text: 'Mahal kita', roman: '', hangul: '마할 키타' },
            thanks: { text: 'Salamat', roman: '', hangul: '살라맛' },
            pretty: { text: 'Ang ganda mo', roman: '', hangul: '앙 간다 모' },
        },
    },
    {
        code: 'ja',
        speech: 'ja-JP',
        phrases: {
            love: { text: '愛してる', roman: 'aishiteru', hangul: '아이시테루' },
            thanks: { text: 'ありがとう', roman: 'arigatō', hangul: '아리가토' },
            pretty: { text: 'きれいだよ', roman: 'kirei da yo', hangul: '키레이다요' },
        },
    },
    {
        code: 'th',
        speech: 'th-TH',
        phrases: {
            love: { text: 'ผมรักคุณ', roman: 'phom rak khun', hangul: '폼 락 쿤' },
            thanks: { text: 'ขอบคุณครับ', roman: 'khop khun khrap', hangul: '콥쿤 크랍' },
            pretty: { text: 'คุณสวยมาก', roman: 'khun suai mak', hangul: '쿤 쑤어이 막' },
        },
    },
    {
        code: 'en',
        speech: 'en-US',
        phrases: {
            love: { text: 'I love you', roman: '', hangul: '아이 러브 유' },
            thanks: { text: 'Thank you', roman: '', hangul: '땡큐' },
            pretty: { text: 'You are beautiful', roman: '', hangul: '유 아 뷰티풀' },
        },
    },
];

export function findWifeLanguage(code) {
    return WIFE_LANGUAGES.find((l) => l.code === code) ?? WIFE_LANGUAGES[0];
}
