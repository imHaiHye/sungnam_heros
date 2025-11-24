// Global Variables
let totalPoints = 12000;
let weekCompleted = 2;
let todayCompleted = 0;
let selectedKeywords = [];
let currentMissionType = '';
let currentMissionDifficulty = '';
let pinkMissions = 1;
let greenMissions = 1;
let yellowMissions = 0;

// Diary Sample Data
let diaryEntries = [
        {
        type: 'yellow',
        difficulty: 'medium',
        mission: { title: '라면 요리사', desc: '주말 아침, 아빠가 라면 요리사 되기' },
        keywordMessage: '',
        familyResponse: '"와 아빠가 요리해주니까 더 맛있어요! 내일도 해주세요~"',
        myResponse: '"그럼! 아빠가 매주 주말 아침은 책임질게! 같이 먹으니 더 맛있네 ㅎㅎ"',
        date: '2025년 11월 21일 오전 9:20',
        points: 2000,
        timestamp: new Date('2025-11-21T09:20:00').getTime(),
        image: 'images/라면.jpg'
    },
    {
        type: 'pink',
        difficulty: 'easy',
        mission: { title: '1분 칭찬하기', desc: '키워드 조합하여 애정 표현하기' },
        keywordMessage: '"사랑해! 항상 고마워하고 최고야! 💕"',
        familyResponse: '"어머, 갑자기 왜 그래요? 근데 기분 좋네요 😊"',
        myResponse: '"그렇게 말해줘서 고마워! 앞으로 더 자주 표현할게 ^^"',
        date: '2025년 11월 19일 오후 8:32',
        points: 1000,
        timestamp: new Date('2025-11-19T20:32:00').getTime(),
        image: null
    },
    {
        type: 'green',
        difficulty: 'easy',
        mission: { title: '비행기 태우기', desc: '번쩍 들어 비행기 태우기' },
        keywordMessage: '',
        familyResponse: '"아빠 재밌어요! 더 높이 올려주세요!! ㅎㅎ 😄"',
        myResponse: '"우리 딸이 좋아하니까 아빠도 행복해! 매일 같이 놀자 ^^"',
        date: '2025년 11월 20일 오후 6:15',
        points: 1000,
        timestamp: new Date('2025-11-20T18:15:00').getTime(),
        image: null
    }

];

// Badge Thresholds
const badgeThresholds = [
    { level: 0, points: 0, title: "입문 아빠", icon: "🌱", color: "linear-gradient(90deg, #718096, #4A5568)" },
    { level: 1, points: 1000, title: "새내기 아빠", icon: "🌿", color: "linear-gradient(90deg, #94A3B8, #64748B)" },
    { level: 2, points: 10000, title: "열정부자 아빠", icon: "🌷", color: "linear-gradient(90deg, #CD7F32, #A0522D)" },
    { level: 3, points: 30000, title: "파워 아빠", icon: "🍎", color: "linear-gradient(90deg, #C0C0C0, #A9A9A9)" },
    { level: 4, points: 50000, title: "슈퍼히어로 아빠", icon: "🌳", color: "linear-gradient(90deg, #FFD700, #FFA500)" },
    { level: 5, points: 100000, title: "전설의 아빠", icon: "👑", color: "linear-gradient(90deg, #8B5CF6, #7C3AED)" }
];

// Mission Data
const missionData = {
    pink: {
        title: '핑크 미션',
        subtitle: 'To. 아내',
        gradient: 'linear-gradient(135deg, #ff6b9d, #c44569)',
        easy: { title: '1분 칭찬하기', desc: '키워드 조합하여 애정 표현하기', points: 1000 },
        medium: { title: '10분 함께하기', desc: '아내 모국어로 애정 표현 배우기', points: 2000 },
        hard: { title: '30분 데이트', desc: '자녀 잠시 맡기고 부부 동네 산책', points: 3000 }
    },
    green: {
        title: '그린 미션',
        subtitle: 'To. 자녀',
        gradient: 'linear-gradient(135deg, #4ade80, #10b981)',
        easy: { title: '비행기 태우기', desc: '번쩍 들어 비행기 태우기', points: 1000 },
        medium: { title: '간식 타임', desc: '자녀와 간식 먹으며 오늘 일상 대화', points: 2000 },
        hard: { title: '놀이터 가기', desc: '밖에서 같이 배드민턴/축구 시합', points: 3000 }
    },
    yellow: {
        title: '옐로우 미션',
        subtitle: 'To. 가족',
        gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
        easy: { title: '단톡방 활성화', desc: '가족 단톡방에 재미있는 사진 공유', points: 1000 },
        medium: { title: '라면 요리사', desc: '주말 아침, 아빠가 라면 요리사 되기', points: 2000 },
        hard: { title: '대청소 데이', desc: '다 같이 대청소하고 배달 음식 시켜먹기', points: 3000 }
    }
};

// Badge Functions
function getCurrentBadge() {
    let currentBadge = badgeThresholds[0];
    for (let i = badgeThresholds.length - 1; i >= 0; i--) {
        if (totalPoints >= badgeThresholds[i].points) {
            currentBadge = badgeThresholds[i];
            break;
        }
    }
    return currentBadge;
}

function getNextBadge() {
    const current = getCurrentBadge();
    const nextIndex = badgeThresholds.findIndex(b => b.level === current.level) + 1;
    return nextIndex < badgeThresholds.length ? badgeThresholds[nextIndex] : null;
}

function updateBadgeDisplay() {
    const current = getCurrentBadge();
    const next = getNextBadge();
    
    document.getElementById('badgeIcon').textContent = current.icon;
    document.getElementById('currentBadgeTitle').textContent = current.title;
    document.getElementById('currentBadgeBenefit').textContent = next ? `✨ 다음 목표: ${next.title} 배지` : '✨ 전설적인 아빠! 존경합니다!';
    document.getElementById('badgeProgress').style.background = current.color;

    document.getElementById('headerUserBadge').textContent = current.icon;
    document.querySelectorAll('.user-badge').forEach(el => el.textContent = current.icon);
    
    if (next) {
        const currentThreshold = current.points;
        const nextThreshold = next.points;
        const progress = ((totalPoints - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
        
        document.getElementById('badgeProgress').style.width = Math.min(progress, 100) + '%';
        document.getElementById('badgeProgressText').textContent = 
            `다음 배지까지 ${(next.points - totalPoints).toLocaleString()}P`;
        document.getElementById('nextBadgeInfo').textContent = 
            `다음: ${next.icon} ${next.title}`;
    } else {
        document.getElementById('badgeProgress').style.width = '100%';
        document.getElementById('badgeProgressText').textContent = '최고 배지 획득!';
        document.getElementById('nextBadgeInfo').textContent = '👑 전설 달성!';
    }
}

// Navigation Functions
function navigateTo(pageId, btn) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

// Mission Functions
function selectMission(type, difficulty) {
    currentMissionType = type;
    currentMissionDifficulty = difficulty;
    const mission = missionData[type];
    const selectedMission = mission[difficulty];
    
    document.getElementById('missionHeader').style.background = mission.gradient;
    document.getElementById('missionHeader').innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 48px; margin-bottom: 10px;">
                ${type === 'pink' ? '💖' : type === 'green' ? '💚' : '💛'}
            </div>
            <div style="font-size: 24px; font-weight: bold;">${selectedMission.title}</div>
            <div style="opacity: 0.9; margin-top: 5px;">${selectedMission.desc}</div>
            <div style="background: rgba(255,255,255,0.2); border-radius: 10px; padding: 8px; margin-top: 15px; display: inline-block;">
                <span style="font-size: 12px; opacity: 0.8;">난이도: </span>
                <span style="font-weight: bold;">${difficulty === 'easy' ? '쉬움' : difficulty === 'medium' ? '보통' : '어려움'}</span>
            </div>
            <div style="font-size: 20px; font-weight: bold; margin-top: 10px;">⭐ ${selectedMission.points.toLocaleString()}P</div>
        </div>
    `;

    const keywordSection = document.getElementById('keywordSection');
    keywordSection.style.display = type === 'pink' ? 'block' : 'none';

    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('uploadPlaceholder').style.display = 'flex';
    document.getElementById('missionPhotoInput').value = '';

    document.getElementById('missionModal').classList.add('active');
}

function closeMissionModal() {
    document.getElementById('missionModal').classList.remove('active');
    selectedKeywords = [];
    document.querySelectorAll('.keyword-btn').forEach(btn => btn.classList.remove('selected'));
    document.getElementById('generatedMessage').textContent = '키워드를 선택해주세요 💖';
    document.getElementById('familyResponse').value = '';
    document.getElementById('myResponse').value = '';
}

function toggleKeyword(btn, keyword) {
    btn.classList.toggle('selected');
    if (selectedKeywords.includes(keyword)) {
        selectedKeywords = selectedKeywords.filter(k => k !== keyword);
    } else {
        selectedKeywords.push(keyword);
    }
    updateGeneratedMessage();
}

function updateGeneratedMessage() {
    const messageEl = document.getElementById('generatedMessage');
    if (selectedKeywords.length === 0) {
        messageEl.textContent = '키워드를 선택해주세요 💖';
    } else if (selectedKeywords.length === 1) {
        messageEl.textContent = `당신이 ${selectedKeywords[0]} 💕`;
    } else if (selectedKeywords.length === 2) {
        messageEl.textContent = `${selectedKeywords[0]}! 항상 ${selectedKeywords[1]} 💕`;
    } else {
        messageEl.textContent = `${selectedKeywords[0]}! ${selectedKeywords[1]}하고 ${selectedKeywords[2]}! 💕`;
    }
}

function previewImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('imagePreview').src = e.target.result;
            document.getElementById('imagePreview').style.display = 'block';
            document.getElementById('uploadPlaceholder').style.display = 'none';
        }
        reader.readAsDataURL(input.files[0]);
    }
}

function completeMission() {
    const familyResponse = document.getElementById('familyResponse').value;
    const myResponse = document.getElementById('myResponse').value;
    const photoInput = document.getElementById('missionPhotoInput');

    if (!familyResponse || !myResponse) {
        alert('가족 반응과 나의 재반응을 모두 입력해주세요!');
        return;
    }
    
    let uploadedImage = null;
    if (photoInput.files.length === 0) {
        if(!confirm('인증샷 없이 완료하시겠습니까? (사진을 올리면 더 생생한 추억이 됩니다!)')) {
            return;
        }
    } else {
        // 이미지가 업로드된 경우
        uploadedImage = document.getElementById('imagePreview').src;
    }

    const mission = missionData[currentMissionType];
    const selectedMission = mission[currentMissionDifficulty];
    const earnedPoints = selectedMission.points;
    
    totalPoints += earnedPoints;
    todayCompleted++;
    
    if (currentMissionType === 'pink') pinkMissions++;
    else if (currentMissionType === 'green') greenMissions++;
    else if (currentMissionType === 'yellow') yellowMissions++;

    const now = new Date();
    const dateString = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 ${now.getHours() > 12 ? '오후' : '오전'} ${now.getHours() > 12 ? now.getHours() - 12 : now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const diaryEntry = {
        type: currentMissionType,
        difficulty: currentMissionDifficulty,
        mission: selectedMission,
        keywordMessage: selectedKeywords.length > 0 ? document.getElementById('generatedMessage').textContent : '',
        familyResponse: familyResponse,
        myResponse: myResponse,
        date: dateString,
        points: earnedPoints,
        timestamp: now.getTime(),
        image: uploadedImage
    };
    
    diaryEntries.unshift(diaryEntry);
    updateDiaryDisplay();
    renderCalendar();

    document.getElementById('totalPoints').textContent = totalPoints.toLocaleString() + 'P';
    document.getElementById('earnedPoints').textContent = '+' + earnedPoints.toLocaleString() + 'P';
    document.getElementById('todayCount').textContent = todayCompleted;
    document.getElementById('todayProgress').style.width = Math.min(todayCompleted * 33, 100) + '%';

    updateBadgeDisplay();

    document.getElementById('pinkCount').textContent = pinkMissions;
    document.getElementById('greenCount').textContent = greenMissions;
    document.getElementById('yellowCount').textContent = yellowMissions;
    document.getElementById('totalMissions').textContent = pinkMissions + greenMissions + yellowMissions;

    closeMissionModal();
    document.getElementById('celebration').classList.add('active');

    setTimeout(() => {
        document.getElementById('celebration').classList.remove('active');
    }, 2500);
}

// Game Functions
function showGame(gameType) {
    const gameContent = document.getElementById('gameContent');
    
    if (gameType === 'quiz') {
        const questions = [
            "아내가 가장 좋아하는 음식은?",
            "자녀가 제일 좋아하는 놀이는?",
            "우리 가족이 처음 만난 장소는?",
            "아내의 꿈은 무엇인가요?",
            "자녀가 커서 되고 싶어하는 직업은?"
        ];
        
        let quizHTML = `
            <button class="back-btn" onclick="closeGame()">← 돌아가기</button>
            <h2 style="font-size: 24px; font-weight: bold; margin: 20px 0; text-align: center;">
                🎯 가족 Quiz
            </h2>
            <div style="text-align: center; font-size: 14px; opacity: 0.8; margin-bottom: 30px;">
                서로에 대해 얼마나 알고 있는지 확인해보세요!
            </div>
        `;
        
        questions.forEach((q, i) => {
            quizHTML += `
                <div class="quiz-question">
                    <div style="font-size: 18px; font-weight: bold; margin-bottom: 15px;">
                        ${i + 1}. ${q}
                    </div>
                    <input type="text" placeholder="답을 입력하세요" style="margin-top: 10px;">
                </div>
            `;
        });
        
        quizHTML += '<button class="btn-primary" onclick="alert(\'정말 잘 알고 계시네요! 🎉 가족과 함께 답을 확인해보세요.\')">답안 제출</button>';
        gameContent.innerHTML = quizHTML;
    }
    else if (gameType === 'roleSwap') {
        gameContent.innerHTML = `
            <button class="back-btn" onclick="closeGame()">← 돌아가기</button>
            <h2 style="font-size: 24px; font-weight: bold; margin: 20px 0; text-align: center;">
                🔄 역할 교환 게임
            </h2>
            <div style="text-align: center; font-size: 14px; opacity: 0.8; margin-bottom: 30px;">
                가족 구성원을 입력하면 랜덤으로 역할을 바꿔드려요!
            </div>

            <div class="input-group">
                <label class="input-label">가족 구성원 입력</label>
                <div id="familyMembers">
                    <div class="family-member-input">
                        <input type="text" placeholder="예: 아빠" value="아빠">
                    </div>
                    <div class="family-member-input">
                        <input type="text" placeholder="예: 엄마" value="엄마">
                    </div>
                    <div class="family-member-input">
                        <input type="text" placeholder="예: 자녀 이름" value="민수">
                    </div>
                </div>
                <button class="add-member-btn" onclick="addFamilyMember()">+ 가족 추가</button>
            </div>

            <button class="btn-primary" onclick="shuffleRoles()">🎲 역할 섞기!</button>

            <div id="roleResults" style="margin-top: 30px;"></div>
        `;
    }
    else if (gameType === 'empathy') {
        gameContent.innerHTML = `
            <button class="back-btn" onclick="closeGame()">← 돌아가기</button>
            <h2 style="font-size: 24px; font-weight: bold; margin: 20px 0; text-align: center;">
                💬 그랬구나~ 게임
            </h2>
            <div style="text-align: center; font-size: 14px; opacity: 0.8; margin-bottom: 30px;">
                가족의 이야기를 경청하고 "그랬구나~" 하며 공감해주세요!
            </div>

            <div style="background: rgba(255,255,255,0.1); border-radius: 15px; padding: 25px; margin: 20px 0; text-align: center;">
                <div style="font-size: 16px; font-weight: bold; margin-bottom: 15px;">게임 방법</div>
                <div style="font-size: 14px; line-height: 1.8; text-align: left;">
                    1. 한 사람이 오늘 있었던 일을 이야기합니다<br>
                    2. 듣는 사람은 중간에 끊지 않고 끝까지 경청합니다<br>
                    3. 이야기가 끝나면 "그랬구나~"로 시작하여 공감합니다<br>
                    4. 조언이나 해결책 제시는 금지! 오직 공감만!<br>
                    5. 3분 동안 돌아가며 진행합니다
                </div>
            </div>

            <div class="timer" id="empathyTimer">3:00</div>

            <button class="btn-primary" onclick="startEmpathyTimer()">⏱️ 타이머 시작</button>
        `;
    }
    else if (gameType === 'interview') {
        const questions = [
            "오늘 가장 기억에 남는 순간은?",
            "요즘 가장 하고 싶은 것은 무엇인가요?",
            "나에게 힘이 되는 말은?",
            "어렸을 때 가장 기억에 남는 순간은?",
            "10년 후 우리 가족은 어떤 모습일까요?"
        ];

        let interviewHTML = `
            <button class="back-btn" onclick="closeGame()">← 돌아가기</button>
            <h2 style="font-size: 24px; font-weight: bold; margin: 20px 0; text-align: center;">
                🎤 가족 인터뷰
            </h2>
            <div style="text-align: center; font-size: 14px; opacity: 0.8; margin-bottom: 30px;">
                서로에게 질문하고 답하며 더 깊이 알아가세요!
            </div>
        `;

        questions.forEach((q, i) => {
            interviewHTML += `
                <div class="quiz-question">
                    <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">
                        ${i + 1}. ${q}
                    </div>
                    <div style="font-size: 13px; opacity: 0.8; margin-top: 10px;">
                        💡 가족에게 직접 물어보고 대화를 나눠보세요
                    </div>
                </div>
            `;
        });

        interviewHTML += `
            <div style="background: rgba(255,255,255,0.1); border-radius: 15px; padding: 20px; margin-top: 20px;">
                <div style="font-weight: bold; margin-bottom: 10px;">💡 인터뷰 팁</div>
                <div style="font-size: 14px; line-height: 1.6;">
                    • 편안한 분위기에서 진행하세요<br>
                    • 눈을 마주치며 이야기하세요<br>
                    • 답변에 깊이 공감해주세요<br>
                    • 서두르지 말고 충분히 대화하세요
                </div>
            </div>
        `;

        gameContent.innerHTML = interviewHTML;
    }

    document.getElementById('gameModal').classList.add('active');
}

function closeGame() {
    document.getElementById('gameModal').classList.remove('active');
}

function addFamilyMember() {
    const container = document.getElementById('familyMembers');
    const div = document.createElement('div');
    div.className = 'family-member-input';
    div.innerHTML = `
        <input type="text" placeholder="가족 이름">
        <button class="remove-btn" onclick="this.parentElement.remove()">삭제</button>
    `;
    container.appendChild(div);
}

function shuffleRoles() {
    const inputs = document.querySelectorAll('#familyMembers input');
    const members = Array.from(inputs).map(input => input.value).filter(v => v);
    
    if (members.length < 2) {
        alert('최소 2명 이상의 가족 구성원을 입력해주세요!');
        return;
    }
    // To avoid assigning someone to themselves, create a derangement by
    // rotating the list by a random offset between 1 and n-1. Rotation
    // guarantees no fixed points (no member maps to themselves) when
    // members.length > 1.
    const n = members.length;
    const offset = Math.floor(Math.random() * (n - 1)) + 1; // 1..n-1
    const shuffled = members.map((_, i) => members[(i + offset) % n]);

    let resultsHTML = '<h3 style="font-size: 20px; font-weight: bold; text-align: center; margin-bottom: 20px;">🎉 역할이 바뀌었어요!</h3>';

    members.forEach((member, i) => {
        resultsHTML += `
            <div class="role-card">
                <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">
                    ${member} → ${shuffled[i]}
                </div>
                <div style="font-size: 14px; opacity: 0.9;">
                    이제 ${member}님은 ${shuffled[i]}가 되어보세요!
                </div>
            </div>
        `;
    });

    resultsHTML += `
        <div style="background: rgba(255,255,255,0.1); border-radius: 15px; padding: 20px; margin-top: 20px; text-align: center;">
            <div style="font-size: 14px; line-height: 1.6;">
                💡 10분 동안 서로의 역할을 연기해보세요!<br>
                말투, 행동, 습관까지 따라해보면서<br>
                서로의 입장을 이해해봐요
            </div>
        </div>
    `;

    document.getElementById('roleResults').innerHTML = resultsHTML;
}

let empathyTimerInterval;
function startEmpathyTimer() {
    let timeLeft = 180;
    const timerEl = document.getElementById('empathyTimer');
    
    clearInterval(empathyTimerInterval);
    empathyTimerInterval = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
            clearInterval(empathyTimerInterval);
            timerEl.textContent = '완료!';
            alert('시간 종료! 다음 사람 차례예요 😊');
        }
    }, 1000);
}

function showWritePost() {
    document.getElementById('writePostModal').classList.add('active');
}

function closeWritePost() {
    document.getElementById('writePostModal').classList.remove('active');
    document.getElementById('postTitle').value = '';
    document.getElementById('postContent').value = '';
}

function submitPost() {
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;

    if (!title || !content) {
        alert('제목과 내용을 모두 입력해주세요!');
        return;
    }

    alert('글이 등록되었습니다! 🎉');
    closeWritePost();
}

function switchProgressTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    if (tab === 'week') {
        document.getElementById('weekProgressView').style.display = 'block';
        document.getElementById('monthProgressView').style.display = 'none';
    } else {
        document.getElementById('weekProgressView').style.display = 'none';
        document.getElementById('monthProgressView').style.display = 'block';
    }
}

function updateDiaryDisplay() {
    const container = document.getElementById('diaryEntries');
    
    if (diaryEntries.length === 0) {
        container.innerHTML = '<div style="text-align: center; opacity: 0.7; padding: 20px;">아직 기록된 미션이 없어요. 첫 미션을 완료해보세요!</div>';
        return;
    }

    container.innerHTML = '';

    diaryEntries.forEach(entry => {
        const colorMap = {
            pink: { gradient: '#ff6b9d', border: '#ff6b9d', icon: '💖', name: '핑크' },
            green: { gradient: '#4ade80', border: '#4ade80', icon: '💚', name: '그린' },
            yellow: { gradient: '#fbbf24', border: '#fbbf24', icon: '💛', name: '옐로우' }
        };

        const color = colorMap[entry.type];
        const difficultyText = entry.difficulty === 'easy' ? '쉬움' : entry.difficulty === 'medium' ? '보통' : '어려움';

        const entryHTML = `
            <div class="post-card" style="border-left: 4px solid ${color.border}; animation: fadeIn 0.5s;" data-timestamp="${entry.timestamp}">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                    <div>
                        <div style="font-size: 18px; font-weight: bold; margin-bottom: 5px;">
                            ${color.icon} ${color.name} 미션 - ${entry.mission.title}
                        </div>
                        <div style="font-size: 13px; opacity: 0.7;">${entry.date} · ${difficultyText}</div>
                    </div>
                    <div style="background: linear-gradient(135deg, ${color.gradient}, ${color.gradient}); padding: 8px 15px; border-radius: 20px; font-weight: bold; font-size: 14px;">
                        +${entry.points.toLocaleString()}P
                    </div>
                </div>

                ${entry.image ? `
                    <div style="margin-bottom: 15px;">
                        <img src="${entry.image}" alt="미션 인증샷" style="width: 100%; border-radius: 12px; max-height: 300px; object-fit: cover;">
                    </div>
                ` : ''}

                ${entry.keywordMessage ? `
                    <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 15px; margin-bottom: 12px;">
                        <div style="font-size: 13px; opacity: 0.8; margin-bottom: 8px;">💌 내가 한 말:</div>
                        <div style="font-size: 15px; font-weight: bold; line-height: 1.5;">
                            ${entry.keywordMessage}
                        </div>
                    </div>
                ` : `
                    <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 15px; margin-bottom: 12px;">
                        <div style="font-size: 13px; opacity: 0.8; margin-bottom: 8px;">📸 미션 수행:</div>
                        <div style="font-size: 14px; line-height: 1.5;">
                            ${entry.mission.desc}
                        </div>
                    </div>
                `}

                <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 15px; margin-bottom: 12px;">
                    <div style="font-size: 13px; opacity: 0.8; margin-bottom: 8px;">💬 가족의 반응:</div>
                    <div style="font-size: 14px; line-height: 1.5;">
                        ${entry.familyResponse}
                    </div>
                </div>

                <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 15px;">
                    <div style="font-size: 13px; opacity: 0.8; margin-bottom: 8px;">🔄 나의 재반응:</div>
                    <div style="font-size: 14px; line-height: 1.5;">
                        ${entry.myResponse}
                    </div>
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', entryHTML);
    });
}

function showBadgeInfo() {
    document.getElementById('levelInfoModal').classList.add('active');
}

function closeLevelInfo() {
    document.getElementById('levelInfoModal').classList.remove('active');
}

// Notice Detail Functions
function showNoticeDetail(type) {
    const content = document.getElementById('noticeDetailContent');
    
    const noticeData = {
        mentoring: {
            title: '🤝 깐부 멘토링 신청',
            banner: 'linear-gradient(135deg, #667eea, #764ba2)',
            description: '선배 아빠들의 노하우를 배우고, 함께 성장하는 멘토링 프로그램',
            details: `
                <div style="background: rgba(255,255,255,0.1); border-radius: 15px; padding: 20px; margin: 20px 0;">
                    <h3 style="font-size: 18px; margin-bottom: 15px;">📋 프로그램 안내</h3>
                    <div style="font-size: 14px; line-height: 1.8;">
                        <strong>• 대상:</strong> 히어로즈 활동 1개월 이상 아빠<br>
                        <strong>• 멘토:</strong> 전설/슈퍼히어로 배지 보유 선배 아빠<br>
                        <strong>• 방식:</strong> 1:1 또는 소그룹 (3-4명)<br>
                        <strong>• 주제:</strong> 육아 노하우, 아내와의 소통, 미션 팁 등<br>
                        <strong>• 혜택:</strong> 멘티/멘토 모두 추가 포인트 지급
                    </div>
                </div>
                <div style="background: rgba(255,255,255,0.1); border-radius: 15px; padding: 20px; margin: 20px 0;">
                    <h3 style="font-size: 18px; margin-bottom: 15px;">🎯 신청 방법</h3>
                    <div style="font-size: 14px; line-height: 1.8;">
                        1. 아래 신청하기 버튼 클릭<br>
                        2. 간단한 소개와 관심 주제 작성<br>
                        3. 담당자가 3일 내 매칭 결과 연락<br>
                        4. 첫 만남 일정 조율 및 시작!
                    </div>
                </div>
                <button class="btn-primary" onclick="alert('신청이 접수되었습니다! 담당자가 곧 연락드릴게요 😊')">
                    ✅ 멘토링 신청하기
                </button>
            `
        },
        meal: {
            title: '🍽️ 아빠들 식사 모임',
            banner: 'linear-gradient(135deg, #f59e0b, #d97706)',
            description: '맛있는 식사와 함께 아빠들끼리 이야기 나누는 시간',
            details: `
                <div style="background: rgba(255,255,255,0.1); border-radius: 15px; padding: 20px; margin: 20px 0;">
                    <h3 style="font-size: 18px; margin-bottom: 15px;">📅 모임 정보</h3>
                    <div style="font-size: 14px; line-height: 1.8;">
                        <strong>• 일시:</strong> 12월 7일 (토) 오후 6시<br>
                        <strong>• 장소:</strong> 성남시 분당구 판교역 근처 식당 (신청자에게 개별 안내)<br>
                        <strong>• 인원:</strong> 선착순 20명<br>
                        <strong>• 회비:</strong> 1인 2만원 (식사비 포함)<br>
                        <strong>• 혜택:</strong> 성남사랑상품권 1만원 지급
                    </div>
                </div>
                <div style="background: rgba(255,255,255,0.1); border-radius: 15px; padding: 20px; margin: 20px 0;">
                    <h3 style="font-size: 18px; margin-bottom: 15px;">💬 이런 이야기를 나눠요</h3>
                    <div style="font-size: 14px; line-height: 1.8;">
                        • 육아 고민 공유 및 해결 방법<br>
                        • 미션 수행 노하우와 재미있는 에피소드<br>
                        • 아내/자녀와의 관계 개선 경험담<br>
                        • 다문화 가정의 독특한 문화 이야기<br>
                        • 그냥 편하게 수다 떨기! 😄
                    </div>
                </div>
                <button class="btn-primary" onclick="alert('식사 모임 신청이 완료되었습니다! 🎉')">
                    ✅ 모임 참가 신청
                </button>
            `
        },
        sports: {
            title: '🎯 다문화 가족 운동회',
            banner: 'linear-gradient(135deg, #ef4444, #dc2626)',
            description: '온 가족이 함께 뛰고 웃는 신나는 운동회!',
            details: `
                <div style="background: rgba(255,255,255,0.1); border-radius: 15px; padding: 20px; margin: 20px 0;">
                    <h3 style="font-size: 18px; margin-bottom: 15px;">🏃‍♂️ 행사 정보</h3>
                    <div style="font-size: 14px; line-height: 1.8;">
                        <strong>• 일시:</strong> 12월 14일 (토) 오전 10시 ~ 오후 2시<br>
                        <strong>• 장소:</strong> 성남시 종합운동장<br>
                        <strong>• 대상:</strong> 히어로즈 참여 가족 (자녀 동반 필수)<br>
                        <strong>• 참가비:</strong> 무료<br>
                        <strong>• 준비물:</strong> 편한 운동복, 운동화, 개인 물병
                    </div>
                </div>
                <div style="background: rgba(255,255,255,0.1); border-radius: 15px; padding: 20px; margin: 20px 0;">
                    <h3 style="font-size: 18px; margin-bottom: 15px;">🎪 프로그램</h3>
                    <div style="font-size: 14px; line-height: 1.8;">
                        <strong>10:00 - 10:30</strong> 등록 및 팀 구성<br>
                        <strong>10:30 - 11:00</strong> 개회식 및 준비운동<br>
                        <strong>11:00 - 12:30</strong> 가족 단위 게임 대회<br>
                        • 아빠와 자녀 2인3각 달리기<br>
                        • 온 가족 릴레이<br>
                        • 엄마아빠 줄다리기<br>
                        • 보물찾기 미션<br>
                        <strong>12:30 - 14:00</strong> 점심 식사 및 경품 추첨
                    </div>
                </div>
                <div style="background: rgba(255,255,255,0.1); border-radius: 15px; padding: 20px; margin: 20px 0;">
                    <h3 style="font-size: 18px; margin-bottom: 15px;">🎁 경품</h3>
                    <div style="font-size: 14px; line-height: 1.8;">
                        • 1등팀: 성남사랑상품권 10만원<br>
                        • 2등팀: 성남사랑상품권 5만원<br>
                        • 3등팀: 성남사랑상품권 3만원<br>
                        • 전원: 참가 기념품 + 도시락
                    </div>
                </div>
                <button class="btn-primary" onclick="alert('운동회 참가 신청이 완료되었습니다! 🏆')">
                    ✅ 운동회 참가 신청
                </button>
            `
        }
    };
    
    const notice = noticeData[type];
    
    content.innerHTML = `
        <div style="background: ${notice.banner}; border-radius: 20px; padding: 30px; text-align: center; margin: 20px 0;">
            <h2 style="font-size: 28px; font-weight: bold; margin-bottom: 10px;">${notice.title}</h2>
            <div style="font-size: 16px; opacity: 0.9;">${notice.description}</div>
        </div>
        ${notice.details}
    `;
    
    document.getElementById('noticeDetailModal').classList.add('active');
}

function closeNoticeDetail() {
    document.getElementById('noticeDetailModal').classList.remove('active');
}

// Toggle Comments (for future use)
function toggleComments(element) {
    // 클릭 시 확장 효과 등을 추가할 수 있습니다
    // 현재는 단순히 클릭 이벤트만 처리
    console.log('Post clicked');
}

// Notification Modal Functions
function showNotificationModal() {
    document.getElementById('notificationModal').classList.add('active');
}

function closeNotificationModal() {
    document.getElementById('notificationModal').classList.remove('active');
}

// Referral Modal Functions
function showReferralModal() {
    document.getElementById('referralModal').classList.add('active');
}

function closeReferralModal() {
    document.getElementById('referralModal').classList.remove('active');
}

function copyReferralCode() {
    const code = 'HERO2024';
    
    // 클립보드에 복사 시도
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(() => {
            alert('추천인 코드가 복사되었습니다! 📋\n친구에게 공유해보세요.');
        }).catch(() => {
            // 실패 시 폴백
            fallbackCopyCode(code);
        });
    } else {
        // 구형 브라우저 대응
        fallbackCopyCode(code);
    }
}

function fallbackCopyCode(code) {
    // 임시 textarea 생성
    const textarea = document.createElement('textarea');
    textarea.value = code;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        alert('추천인 코드가 복사되었습니다! 📋\n친구에게 공유해보세요.');
    } catch (err) {
        alert('코드: HERO2024\n수동으로 복사해주세요!');
    }
    
    document.body.removeChild(textarea);
}

function shareReferral() {
    const shareText = '🦸‍♂️ 성남 다문화 아빠 히어로즈에 초대합니다!\n\n' +
                     '재미있는 미션으로 가족과 더 가까워지고,\n' +
                     '성남사랑상품권도 받아요!\n\n' +
                     '추천인 코드: HERO2024\n' +
                     '가입하면 우리 둘 다 1만원 상품권! 🎁';
    
    // Web Share API 지원 여부 확인
    if (navigator.share) {
        navigator.share({
            title: '성남 다문화 아빠 히어로즈 초대',
            text: shareText
        }).then(() => {
            console.log('공유 성공!');
        }).catch((error) => {
            console.log('공유 취소:', error);
        });
    } else {
        // Web Share API 미지원 시 클립보드 복사
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(shareText).then(() => {
                alert('초대 메시지가 복사되었습니다!\n친구에게 붙여넣기 해주세요. 📤');
            });
        } else {
            alert(shareText + '\n\n위 내용을 복사해서 친구에게 보내주세요!');
        }
    }
}

// Diary Tab Management
let currentDiaryTab = 'timeline';
let currentCalendarYear = 2025;
let currentCalendarMonth = 11;

function switchDiaryTab(tab) {
    currentDiaryTab = tab;
    document.querySelectorAll('#diaryPage .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    if (tab === 'timeline') {
        document.getElementById('diaryTimelineView').style.display = 'block';
        document.getElementById('diaryCalendarView').style.display = 'none';
    } else {
        document.getElementById('diaryTimelineView').style.display = 'none';
        document.getElementById('diaryCalendarView').style.display = 'block';
        renderCalendar();
    }
}

function changeMonth(delta) {
    currentCalendarMonth += delta;
    if (currentCalendarMonth > 12) {
        currentCalendarMonth = 1;
        currentCalendarYear++;
    } else if (currentCalendarMonth < 1) {
        currentCalendarMonth = 12;
        currentCalendarYear--;
    }
    renderCalendar();
}

function renderCalendar() {
    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    document.getElementById('calendarMonthTitle').textContent = 
        `${currentCalendarYear}년 ${monthNames[currentCalendarMonth - 1]}`;

    const firstDay = new Date(currentCalendarYear, currentCalendarMonth - 1, 1).getDay();
    const daysInMonth = new Date(currentCalendarYear, currentCalendarMonth, 0).getDate();

    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';

    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.style.padding = '15px';
        calendarGrid.appendChild(emptyDay);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentCalendarYear}년 ${currentCalendarMonth}월 ${day}일`;
        const missionsOnDay = diaryEntries.filter(entry => entry.date.includes(dateStr));
        
        const dayCell = document.createElement('div');
        dayCell.style.cssText = `
            padding: 15px 10px;
            text-align: center;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.3s;
            background: ${missionsOnDay.length > 0 ? 'rgba(74, 222, 128, 0.2)' : 'rgba(255,255,255,0.05)'};
            border: ${missionsOnDay.length > 0 ? '2px solid #4ade80' : '1px solid rgba(255,255,255,0.1)'};
            position: relative;
        `;

        dayCell.innerHTML = `
            <div style="font-size: 16px; font-weight: ${missionsOnDay.length > 0 ? 'bold' : 'normal'};">${day}</div>
            ${missionsOnDay.length > 0 ? `<div style="font-size: 10px; color: #4ade80; margin-top: 3px;">●${missionsOnDay.length}개</div>` : ''}
        `;

        dayCell.onmouseover = function() {
            this.style.background = missionsOnDay.length > 0 ? 'rgba(74, 222, 128, 0.3)' : 'rgba(255,255,255,0.1)';
        };
        dayCell.onmouseout = function() {
            this.style.background = missionsOnDay.length > 0 ? 'rgba(74, 222, 128, 0.2)' : 'rgba(255,255,255,0.05)';
        };

        if (missionsOnDay.length > 0) {
            dayCell.onclick = () => showDateMissions(currentCalendarYear, currentCalendarMonth, day, missionsOnDay);
        }

        calendarGrid.appendChild(dayCell);
    }
}

function showDateMissions(year, month, day, missions) {
    const container = document.getElementById('selectedDateMissions');
    
    const colorMap = {
        pink: { gradient: '#ff6b9d', border: '#ff6b9d', icon: '💖', name: '핑크' },
        green: { gradient: '#4ade80', border: '#4ade80', icon: '💚', name: '그린' },
        yellow: { gradient: '#fbbf24', border: '#fbbf24', icon: '💛', name: '옐로우' }
    };

    let html = `
        <div style="background: rgba(255,255,255,0.1); border-radius: 15px; padding: 20px; margin-bottom: 15px;">
            <div style="font-size: 20px; font-weight: bold; text-align: center;">
                📅 ${year}년 ${month}월 ${day}일
            </div>
            <div style="font-size: 14px; text-align: center; opacity: 0.8; margin-top: 5px;">
                총 ${missions.length}개 미션 완료
            </div>
        </div>
    `;

    missions.forEach(entry => {
        const color = colorMap[entry.type];
        const difficultyText = entry.difficulty === 'easy' ? '쉬움' : entry.difficulty === 'medium' ? '보통' : '어려움';

        html += `
            <div class="post-card" style="border-left: 4px solid ${color.border}; margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                    <div>
                        <div style="font-size: 18px; font-weight: bold; margin-bottom: 5px;">
                            ${color.icon} ${color.name} 미션 - ${entry.mission.title}
                        </div>
                        <div style="font-size: 13px; opacity: 0.7;">${entry.date} · ${difficultyText}</div>
                    </div>
                    <div style="background: linear-gradient(135deg, ${color.gradient}, ${color.gradient}); padding: 8px 15px; border-radius: 20px; font-weight: bold; font-size: 14px;">
                        +${entry.points.toLocaleString()}P
                    </div>
                </div>

                ${entry.image ? `
                    <div style="margin-bottom: 15px;">
                        <img src="${entry.image}" alt="미션 인증샷" style="width: 100%; border-radius: 12px; max-height: 300px; object-fit: cover;">
                    </div>
                ` : ''}

                ${entry.keywordMessage ? `
                    <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 15px; margin-bottom: 12px;">
                        <div style="font-size: 13px; opacity: 0.8; margin-bottom: 8px;">💌 내가 한 말:</div>
                        <div style="font-size: 15px; font-weight: bold; line-height: 1.5;">
                            ${entry.keywordMessage}
                        </div>
                    </div>
                ` : `
                    <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 15px; margin-bottom: 12px;">
                        <div style="font-size: 13px; opacity: 0.8; margin-bottom: 8px;">📸 미션 수행:</div>
                        <div style="font-size: 14px; line-height: 1.5;">
                            ${entry.mission.desc}
                        </div>
                    </div>
                `}

                <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 15px; margin-bottom: 12px;">
                    <div style="font-size: 13px; opacity: 0.8; margin-bottom: 8px;">💬 가족의 반응:</div>
                    <div style="font-size: 14px; line-height: 1.5;">
                        ${entry.familyResponse}
                    </div>
                </div>

                <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 15px;">
                    <div style="font-size: 13px; opacity: 0.8; margin-bottom: 8px;">🔄 나의 재반응:</div>
                    <div style="font-size: 14px; line-height: 1.5;">
                        ${entry.myResponse}
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Initialize
updateBadgeDisplay();
updateDiaryDisplay();
renderCalendar();