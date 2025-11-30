/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // 커스텀 색상
      colors: {
        'dal-blue': '#27487E',      // DAL 대표 짙은 파랑
        'dal-yellow': '#F4C430',    // DAL 대표 밝은 노랑
        'ac-brown': '#7D5A44',      // 텍스트 및 테두리 갈색
        'ac-cream': '#FFFBEB',      // 밝은 크림색
        'ac-blue': '#5381B7',       // 입력창 배경용 파랑
        'ac-light-blue': '#86A7D3', // 입력창 포커스 색
        'ac-green': '#6BA42D',      // 성공 상태
        'ac-orange': '#F77F00',     // 강조
      },

      // 커스텀 그림자
      boxShadow: {
        'ac-hard': '0 4px 0 #7D5A44',
        'ac-light': '0 2px 4px rgba(0, 0, 0, 0.1)',
      },

      // 커스텀 애니메이션
      animation: {
        'npc-breathe': 'npc-breathe 3s ease-in-out infinite',
        'cloud-drift': 'cloud-drift 20s linear infinite',
      },

      // 커스텀 키프레임
      keyframes: {
        'npc-breathe': {
          '0%, 100%': {
            transform: 'scale(1)',
            opacity: '1'
          },
          '50%': {
            transform: 'scale(1.02) translateY(-3px)',
            opacity: '1'
          }
        },
        'cloud-drift': {
          '0%': { transform: 'translateX(-100px)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateX(100vw)', opacity: '0' }
        }
      }
    },
  },
  plugins: [],
}
