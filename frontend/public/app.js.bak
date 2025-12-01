// Animal Forest Coding - Frontend Application
const API_BASE = 'http://localhost:5000/api';

let appState = {
  characters: [],
  topics: [],
  selectedCharacter: null,
  selectedTopic: null,
  content: null,
  audioUrl: null,
  isPlaying: false,
};

// 초기화
async function init() {
  console.log('Initializing app...');
  await loadCharacters();
  await loadTopics();
  renderUI();
}

// 캐릭터 로드
async function loadCharacters() {
  try {
    const response = await fetch(`${API_BASE}/characters`);
    const data = await response.json();
    appState.characters = data.data;
    if (appState.characters.length > 0) {
      appState.selectedCharacter = appState.characters[0].id;
    }
    console.log('Characters loaded:', appState.characters.length);
  } catch (err) {
    console.error('Error loading characters:', err);
  }
}

// 주제 로드
async function loadTopics() {
  try {
    const response = await fetch(`${API_BASE}/topics`);
    const data = await response.json();
    appState.topics = data.data;
    if (appState.topics.length > 0) {
      appState.selectedTopic = appState.topics[0].slug;
      await loadContent();
    }
    console.log('Topics loaded:', appState.topics.length);
  } catch (err) {
    console.error('Error loading topics:', err);
  }
}

// 콘텐츠 로드
async function loadContent() {
  if (!appState.selectedCharacter || !appState.selectedTopic) return;

  try {
    const response = await fetch(
      `${API_BASE}/content/${appState.selectedCharacter}/${appState.selectedTopic}`
    );
    const data = await response.json();
    appState.content = data.data;

    // 음성 생성
    if (appState.content) {
      generateAudio(appState.content.text, appState.selectedCharacter);
    }

    renderUI();
    console.log('Content loaded:', appState.content?.title);
  } catch (err) {
    console.error('Error loading content:', err);
  }
}

// 음성 생성
async function generateAudio(text, characterId) {
  try {
    console.log('generateAudio() called with text:', text.substring(0, 50), 'character:', characterId);
    const requestBody = JSON.stringify({
      text: text.substring(0, 100),
      character: characterId,
    });
    console.log('Request body:', requestBody);

    const response = await fetch(`${API_BASE}/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', {
      'Content-Type': response.headers.get('Content-Type'),
      'Content-Length': response.headers.get('Content-Length')
    });

    // Blob으로 받아서 Data URL로 변환
    const responseBlob = await response.blob();
    console.log('Response blob received:', {
      size: responseBlob.size,
      type: responseBlob.type
    });

    // 백엔드에서 받은 WAV 오디오 사용
    const blob = new Blob([responseBlob], { type: 'audio/wav' });
    console.log('Blob with explicit type:', {
      size: blob.size,
      type: blob.type
    });

    appState.audioUrl = URL.createObjectURL(blob);
    console.log('Audio blob URL created:', appState.audioUrl);
    console.log('appState.audioUrl is now:', appState.audioUrl);

    renderUI(); // UI 다시 렌더링해서 버튼 표시

    // 렌더링 후 다시 확인
    setTimeout(() => {
      const audioElement = document.getElementById('audio-player');
      console.log('After render - audio element src:', audioElement?.src);
    }, 100);
  } catch (err) {
    console.error('Error generating audio:', err);
    console.error('Error stack:', err.stack);
  }
}

// UI 렌더링
function renderUI() {
  const root = document.getElementById('root');

  let html = `
    <div style="max-width: 1200px; margin: 0 auto; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;">
      <h1 style="text-align: center; color: #667eea;">🦁 동물 숲 코딩</h1>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 20px 0;">
  `;

  // 캐릭터 선택
  appState.characters.forEach(char => {
    const isSelected = char.id === appState.selectedCharacter;
    html += `
      <button
        onclick="selectCharacter('${char.id}')"
        style="
          padding: 15px;
          border: ${isSelected ? '3px solid #667eea' : '2px solid #ddd'};
          border-radius: 8px;
          background: ${isSelected ? '#f0f4ff' : '#fff'};
          cursor: pointer;
          font-size: 14px;
          font-weight: ${isSelected ? 'bold' : 'normal'};
          transition: all 0.3s;
        "
      >
        ${char.name}<br><small>${char.species}</small>
      </button>
    `;
  });

  html += `
    </div>

    <div style="margin: 20px 0;">
      <label for="topic">주제 선택:</label>
      <select id="topic" onchange="selectTopic(this.value)" style="padding: 10px; margin: 10px 0; width: 100%; max-width: 300px;">
  `;

  appState.topics.forEach(topic => {
    const isSelected = topic.slug === appState.selectedTopic;
    html += `<option value="${topic.slug}" ${isSelected ? 'selected' : ''}>${topic.name}</option>`;
  });

  html += `</select></div>`;

  // 콘텐츠 표시
  if (appState.content) {
    html += `
      <div style="border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 20px 0; background: #f9f9f9;">
        <h2 style="color: #667eea; margin-top: 0;">${appState.content.title}</h2>
        <p style="color: #666;">${appState.content.description}</p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
          <div>
            <p><strong>난이도:</strong> ${appState.content.difficulty}</p>
            <p><strong>예상 시간:</strong> ${appState.content.estimatedTime}분</p>
          </div>
          <div style="background: white; padding: 15px; border-radius: 8px;">
            ${appState.content.imageId ? `
              <img
                id="content-image"
                alt="${appState.content.title}"
                style="max-width: 100%; height: auto; border-radius: 4px;"
              />
            ` : ''}
          </div>
        </div>

        <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0; line-height: 1.6;">
          ${appState.content.text}
        </div>

        ${appState.audioUrl ? `
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 15px; border-radius: 8px; color: white;">
            <button
              id="play-btn"
              onclick="playAudio()"
              style="
                background: white;
                color: #667eea;
                border: none;
                padding: 10px 20px;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
                margin-right: 10px;
              "
            >
              ▶️ 재생
            </button>
            <button
              id="stop-btn"
              onclick="stopAudio()"
              style="
                background: rgba(255, 255, 255, 0.3);
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
              "
            >
              ⏸️ 일시정지
            </button>
            <audio id="audio-player" src="${appState.audioUrl}"></audio>
          </div>
        ` : '<p style="color: #999;">음성 생성 중...</p>'}
      </div>
    `;
  }

  html += `</div>`;

  console.log('Rendering UI with appState.audioUrl:', appState.audioUrl);
  root.innerHTML = html;
  console.log('UI rendered, audio element check:', document.getElementById('audio-player'));
  if (document.getElementById('audio-player')) {
    console.log('Audio element found after render, src:', document.getElementById('audio-player').src);
  }

  // 이미지 로드
  if (appState.content?.imageId) {
    loadImage(appState.content.imageId);
  }
}

// 이미지 로드
function loadImage(imageId) {
  const img = document.getElementById('content-image');
  if (img) {
    // 백엔드 API의 절대 URL 사용
    img.src = `http://localhost:5000/api/images/${imageId}`;
  }
}

// 캐릭터 선택
function selectCharacter(charId) {
  appState.selectedCharacter = charId;
  appState.isPlaying = false;
  loadContent();
}

// 주제 선택
function selectTopic(slug) {
  appState.selectedTopic = slug;
  appState.isPlaying = false;
  loadContent();
}

// 음성 재생
function playAudio() {
  const audio = document.getElementById('audio-player');
  console.log('playAudio() called');
  console.log('Audio element:', audio);
  console.log('Audio src:', audio?.src);
  console.log('appState.audioUrl:', appState.audioUrl);

  if (audio) {
    console.log('Audio element found, attempting to play...');
    console.log('Audio canPlayType check:', audio.canPlayType('audio/mpeg'));
    audio.play().then(() => {
      console.log('Audio playing successfully');
      appState.isPlaying = true;
    }).catch(err => {
      console.error('Error playing audio:', err);
    });
  } else {
    console.error('Audio element not found!');
  }
}

// 음성 중지
function stopAudio() {
  const audio = document.getElementById('audio-player');
  console.log('stopAudio() called');
  console.log('Audio element:', audio);

  if (audio) {
    console.log('Pausing audio...');
    audio.pause();
    appState.isPlaying = false;
  } else {
    console.error('Audio element not found!');
  }
}

// 앱 시작
init();
