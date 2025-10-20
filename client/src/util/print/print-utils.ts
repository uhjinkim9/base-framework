export class PrintUtils {
  /**
   * 특정 DOM 요소를 A4 사이즈로 인쇄
   */
  static printElement(element: HTMLElement, title?: string): void {
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      alert("팝업이 차단되었습니다. 팝업을 허용해주세요.");
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${title || "문서 인쇄"}</title>
          <style>
            @page {
              size: A4;
              margin: 20mm;
            }
            
            * {
              box-sizing: border-box;
              /* 배경색 강제 인쇄 */
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }            
            
            body {
              margin: 0;
              padding: 0;
              background: white;
              color: black;
            }
            
            // 인쇄시 불필요한 요소들 숨기기
            .no-print,
            button,
            [contenteditable] {
              display: none !important;
            }
          </style>
        </head>
        <body>
          ${element.innerHTML}
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();

    // 이미지 로딩 대기 후 인쇄
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  }

  /**
   * A4 미리보기 모달 표시
   */
  static showPrintPreview(element: HTMLElement, onPrint: () => void): void {
    const modal = document.createElement("div");
    modal.className = "print-preview-modal";
    modal.innerHTML = `
      <div class="print-preview-overlay">
        <div class="print-preview-content">
          <div class="print-preview-actions">
            <button class="btn-print">인쇄</button>
            <button class="btn-close">닫기</button>
          </div>
          <div class="print-preview-paper">
            ${element.innerHTML}
          </div>
        </div>
      </div>
    `;

    // 스타일 추가
    const style = document.createElement("style");
    style.textContent = `
      .print-preview-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.8);
        z-index: 9999;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      
      .print-preview-overlay {
        width: 90vw;
        height: 90vh;
        background: #f0f0f0;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      
      .print-preview-actions {
        padding: 10px 20px;
        background: white;
        border-bottom: 1px solid #ddd;
        display: flex;
        gap: 10px;
        justify-content: flex-end;
      }
      
      .print-preview-actions button {
        padding: 8px 16px;
        border: 1px solid #ddd;
        background: white;
        cursor: pointer;
        border-radius: 4px;
      }
      
      .btn-print {
        background: #007bff !important;
        color: white !important;
      }
      
      .print-preview-paper {
        flex: 1;
        overflow: auto;
        padding: 40px;
        display: flex;
        justify-content: center;
      }
      
      .print-preview-paper > div {
        width: 210mm;
        min-height: 297mm;
        background: white;
        padding: 20mm;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
      }

    `;

    document.head.appendChild(style);
    document.body.appendChild(modal);

    // 이벤트 리스너
    modal.querySelector(".btn-print")?.addEventListener("click", () => {
      onPrint();
      document.body.removeChild(modal);
      document.head.removeChild(style);
    });

    modal.querySelector(".btn-close")?.addEventListener("click", () => {
      document.body.removeChild(modal);
      document.head.removeChild(style);
    });
  }
}
