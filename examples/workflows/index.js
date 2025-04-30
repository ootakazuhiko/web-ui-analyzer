// index.js
// Web UI Analyzer - Sample Workflow Selection Script (English & Japanese)

const readline = require('readline');
const { runEcommerceFlow } = require('./ecommerce-flow');
const { runLayoutAnalysisFlow } = require('./layout-analysis-flow');
const { runAccessibilityAuditFlow } = require('./accessibility-audit-flow');

// Language setting (default: English)
let language = process.env.LANG && process.env.LANG.startsWith('ja') ? 'ja' : 'en';

// Texts for UI in both languages
const texts = {
  en: {
    title: '===== Web UI Analyzer - Sample Workflows =====',
    instruction: 'Please select from the following sample workflows:',
    options: [
      '1. E-commerce Site Purchase Flow',
      '2. Layout Analysis Specialized Workflow',
      '3. Accessibility Audit Workflow',
      '0. Exit'
    ],
    prompt: '\nSelect an option (0-3): ',
    invalidChoice: 'Invalid selection. Please try again.',
    continuePrompt: '\nWould you like to run another workflow? (y/n): ',
    exiting: 'Exiting. Thank you!',
    error: 'An error occurred:'
  },
  ja: {
    title: '===== Web UI分析ツール - サンプルワークフロー =====',
    instruction: '以下のサンプルワークフローから選択してください：',
    options: [
      '1. Eコマースサイト購入フロー',
      '2. レイアウト分析特化ワークフロー', 
      '3. アクセシビリティ監査ワークフロー',
      '0. 終了'
    ],
    prompt: '\n選択してください (0-3): ',
    invalidChoice: '無効な選択です。もう一度選んでください。',
    continuePrompt: '\n別のワークフローを実行しますか？(y/n): ',
    exiting: '終了します。ありがとうございました！',
    error: 'エラーが発生しました:'
  }
};

/**
 * Function to get user input
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
 * Language selection function
 */
async function selectLanguage() {
  console.log('Select language / 言語を選択してください:');
  console.log('1. English');
  console.log('2. 日本語');
  
  const choice = await getUserInput('\nSelect (1-2): ');
  
  if (choice.trim() === '2') {
    language = 'ja';
    console.log('日本語が選択されました。\n');
  } else {
    language = 'en';
    console.log('English has been selected.\n');
  }
}

/**
 * Select and run a sample workflow
 */
async function selectWorkflow() {
  // First ask for language preference
  await selectLanguage();
  
  const t = texts[language];
  
  console.log(t.title);
  console.log(t.instruction);
  t.options.forEach(option => console.log(option));
  
  const choice = await getUserInput(t.prompt);
  
  switch (choice.trim()) {
    case '1':
      await runEcommerceFlow(language);
      break;
    case '2':
      await runLayoutAnalysisFlow(language);
      break;
    case '3':
      await runAccessibilityAuditFlow(language);
      break;
    case '0':
      console.log(t.exiting);
      process.exit(0);
      break;
    default:
      console.log(t.invalidChoice);
      await selectWorkflow();
      break;
  }
  
  // Ask to continue
  const continueAnswer = await getUserInput(t.continuePrompt);
  if (continueAnswer.toLowerCase() === 'y') {
    await selectWorkflow();
  } else {
    console.log(t.exiting);
  }
}

// Main execution
if (require.main === module) {
  selectWorkflow().catch(error => {
    console.error(texts[language].error, error);
    process.exit(1);
  });
}

module.exports = { selectWorkflow, selectLanguage };