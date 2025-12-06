/**
 * 이미지 처리 유틸리티
 */

/**
 * 이미지의 특정 배경색을 투명하게 만듭니다.
 * @param imageUrl 이미지 URL
 * @param tolerance 허용 오차 (0~255), 흰색과 얼마나 비슷한 색까지 지울지 결정
 * @returns 투명 배경이 적용된 이미지의 Data URL (Promise)
 */
export const makeImageTransparent = (imageUrl: string, tolerance: number = 30): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous'; // CORS 문제 방지
        img.src = imageUrl;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }

            ctx.drawImage(img, 0, 0);

            // 이미지 데이터 가져오기
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // 픽셀 순회하며 흰색 투명화
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // 흰색에 가까운지 확인 (RGB 모두 255 - tolerance 이상)
                if (r >= 255 - tolerance && g >= 255 - tolerance && b >= 255 - tolerance) {
                    data[i + 3] = 0; // Alpha 값을 0으로 설정 (투명)
                }
            }

            // 수정된 데이터 다시 그리기
            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL());
        };

        img.onerror = (err) => {
            console.error('Image loading failed:', err);
            reject(err);
        };
    });
};
