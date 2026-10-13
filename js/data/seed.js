// Sample content so the demo does not open on empty screens. Timestamps are
// relative to "now" so the sample week and month always look current.

import { LEVEL_POINTS } from './missions.js';
import { addDays, startOfDay } from '../core/domain.js';

export const REFERRAL_CODE = 'HERO2024';

export const NOTICES = [
    { id: 'mentoring', icon: '🤝', rows: ['who', 'mentor', 'how', 'topic', 'benefit'] },
    { id: 'meal', icon: '🍽️', rows: ['when', 'where', 'limit', 'fee', 'benefit'] },
    { id: 'sports', icon: '🎯', rows: ['when', 'where', 'who', 'fee', 'bring', 'prize'] },
];

const SAMPLE_ENTRIES = [
    {
        daysAgo: 1, hour: 9, minute: 20, missionId: 'yellow.medium', photo: 'images/라면.jpg',
        familyResponse: '"와 아빠가 요리해주니까 더 맛있어요! 내일도 해주세요~"',
        myResponse: '"그럼! 아빠가 매주 주말 아침은 책임질게! 같이 먹으니 더 맛있네 ㅎㅎ"',
    },
    {
        daysAgo: 2, hour: 18, minute: 15, missionId: 'green.easy',
        familyResponse: '"아빠 재밌어요! 더 높이 올려주세요!! ㅎㅎ 😄"',
        myResponse: '"우리 딸이 좋아하니까 아빠도 행복해! 매일 같이 놀자 ^^"',
    },
    {
        daysAgo: 3, hour: 20, minute: 32, missionId: 'pink.easy',
        keywordMessage: '사랑해! 항상 고마워하고 최고야! 💕',
        familyResponse: '"어머, 갑자기 왜 그래요? 근데 기분 좋네요 😊"',
        myResponse: '"그렇게 말해줘서 고마워! 앞으로 더 자주 표현할게 ^^"',
    },
    { daysAgo: 6, hour: 21, minute: 5, missionId: 'yellow.easy', reaction: 'smile', reply: 'again' },
    { daysAgo: 9, hour: 20, minute: 10, missionId: 'pink.medium', reaction: 'shy', reply: 'thanks' },
    { daysAgo: 12, hour: 15, minute: 30, missionId: 'green.hard', reaction: 'happy', reply: 'metoo' },
    { daysAgo: 16, hour: 20, minute: 45, missionId: 'green.medium', reaction: 'happy', reply: 'again' },
];

const SAMPLE_POSTS = [
    {
        minutesAgo: 5, author: '황혁주', badgeLevel: 5, likes: 12, comments: 3, image: 'images/호떡.jpg',
        title: '주말 아침에 아내 간식 사줬어요! 🎉',
        text: '가족 Quiz 게임 했는데, 아내가 호떡을 좋아하더라고요! 그래서 주말에 같이 호떡 먹으러 갔습니다. 가족들과 좋은 시간 보냈어요😊',
    },
    {
        minutesAgo: 60, author: '이우곤', badgeLevel: 4, likes: 8, comments: 2, image: 'images/토스트.jpg',
        title: '아침에 토스트 만들어줬어요!',
        text: '어제 저녁에 요리 미션 하려고 토스트 만들었는데요, 치즈랑 토마토 올리니까 진짜 맛있더라구요. 가족들이 칭찬해줬어요ㅎㅎ',
    },
    {
        minutesAgo: 180, author: '염기영', badgeLevel: 3, likes: 25, comments: 5, image: 'images/카페.jpg',
        title: '오늘 아내랑 카페 데이트! 🏆',
        text: "처음에는 '내가 할 수 있을까?' 했는데, 오늘 아내랑 카페 가서 커피 마시며 대화했어요. 가족들도 아빠가 달라졌다고 좋아하네요 ㅎㅎ",
    },
];

export function sampleEntries(now) {
    return SAMPLE_ENTRIES.map((s, i) => {
        const [type, level] = s.missionId.split('.');
        const d = new Date(addDays(startOfDay(now), -s.daysAgo));
        d.setHours(s.hour, s.minute, 0, 0);
        return {
            id: `sample-${i}`,
            missionId: s.missionId,
            type,
            level,
            points: LEVEL_POINTS[level],
            ts: d.getTime(),
            photo: s.photo ?? null,
            keywordMessage: s.keywordMessage ?? '',
            reaction: s.reaction ?? null,
            familyResponse: s.familyResponse ?? '',
            reply: s.reply ?? null,
            myResponse: s.myResponse ?? '',
            sample: true,
        };
    });
}

export function samplePosts(now) {
    return SAMPLE_POSTS.map((p, i) => ({
        id: `sample-post-${i}`,
        author: p.author,
        badgeLevel: p.badgeLevel,
        title: p.title,
        text: p.text,
        image: p.image,
        ts: now - p.minutesAgo * 60 * 1000,
        likes: p.likes,
        comments: p.comments,
        mine: false,
    }));
}
