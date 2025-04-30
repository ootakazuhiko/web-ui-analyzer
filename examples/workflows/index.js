// index.js
// Web UI分析ツール サンプルワークフロー選択スクリプト

const readline = require('readline');
const { runEcommerceFlow } = require('./ecommerce-flow');
const { runLayoutAnalysisFlow } = require('./layout-analysis-flow');
const { runAccessibilityAuditFlow } = require('./accessibility-audit-flow');

/**
 * ユーザー入力を取得する関数
 */
function getUserInput(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    process.stdout.write(question);
    
    rl.once('line', (line) => {
      rl.close();
      resolve(line);
    });
  });
}

/**
 * サンプルワークフローを選択して実行する
 */
async function selectWorkflow() {
  console.log('===== Web UI分析ツール - サンプルワークフロー =====');
  console.log('以下のサンプルワークフローから選択してください：');
  console.log('1. Eコマースサイト購入フロー');
  console.log('2. レイアウト分析特化ワークフロー');
  console.log('3. アクセシビリティ監査ワークフロー');
  console.log('0. 終了');
  
  const choice = await getUserInput('\n選択してください (0-3): ');
  
  switch (choice.trim()) {
    case '1':
      await runEcommerceFlow();
      break;
    case '2':
      await runLayoutAnalysisFlow();
      break;
    case '3':
      await runAccessibilityAuditFlow();
      break;
    case '0':
      console.log('終了します');
      process.exit(0);
      break;
    default:
      console.log('無効な選択です。もう一度選んでください。');
      await selectWorkflow();
      break;
  }
  
  // 続行するか確認
  const continueAnswer = await getUserInput('\n別のワークフローを実行しますか？(y/n): ');
  if (continueAnswer.toLowerCase() === 'y') {
    await selectWorkflow();
  } else {
    console.log('終了します。ありがとうございました！');
  }
}

// メイン実行
if (require.main === module) {
  selectWorkflow().catch(error => {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  });
}

module.exports = { selectWorkflow };