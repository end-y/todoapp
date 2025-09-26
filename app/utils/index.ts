import { Task } from '@/types/entities';

export const getHTMLContent = (
  listTasks: Task[],
  currentDate: string,
  completedTasks: Task[],
  pendingTasks: Task[]
) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @page {
            margin: 20px;
          }
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #007AFF;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #007AFF;
            font-size: 28px;
            margin: 0;
            font-weight: 300;
          }
          .date {
            color: #666;
            font-size: 14px;
            margin-top: 10px;
          }
          .stats {
            display: flex;
            justify-content: space-around;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          .stat {
            text-align: center;
          }
          .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #007AFF;
          }
          .stat-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
          }
          .section {
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 1px solid #eee;
          }
          .completed {
            color: #34C759;
          }
          .pending {
            color: #FF9500;
          }
          .task-item {
            display: flex;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #f0f0f0;
          }
          .task-item:last-child {
            border-bottom: none;
          }
          .task-icon {
            font-size: 18px;
            margin-right: 12px;
            width: 20px;
          }
          .task-text {
            flex: 1;
            font-size: 16px;
          }
          .completed-task {
            text-decoration: line-through;
            color: #999;
          }
          .empty-state {
            text-align: center;
            color: #999;
            font-style: italic;
            padding: 20px;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #999;
            border-top: 1px solid #eee;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📋 Görev Listesi</h1>
          <div class="date">${currentDate} tarihinde yazdırıldı</div>
        </div>

        <div class="stats">
          <div class="stat">
            <div class="stat-number">${listTasks.length}</div>
            <div class="stat-label">Toplam Görev</div>
          </div>
          <div class="stat">
            <div class="stat-number">${completedTasks.length}</div>
            <div class="stat-label">Tamamlanan</div>
          </div>
          <div class="stat">
            <div class="stat-number">${pendingTasks.length}</div>
            <div class="stat-label">Bekleyen</div>
          </div>
        </div>

        ${
          pendingTasks.length > 0
            ? `
        <div class="section">
          <h2 class="section-title pending">⏳ Bekleyen Görevler (${pendingTasks.length})</h2>
          ${pendingTasks
            .map(
              (task) => `
            <div class="task-item">
              <span class="task-icon">⭕</span>
              <span class="task-text">${task.name}</span>
            </div>
          `
            )
            .join('')}
        </div>
        `
            : ''
        }

        ${
          completedTasks.length > 0
            ? `
        <div class="section">
          <h2 class="section-title completed">✅ Tamamlanan Görevler (${completedTasks.length})</h2>
          ${completedTasks
            .map(
              (task) => `
            <div class="task-item">
              <span class="task-icon">✅</span>
              <span class="task-text completed-task">${task.name}</span>
            </div>
          `
            )
            .join('')}
        </div>
        `
            : ''
        }

        <div class="footer">
          Bu liste Seven Apps Todo uygulaması ile oluşturulmuştur.
        </div>
      </body>
    </html>
  `;
};
