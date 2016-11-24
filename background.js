let currentTab;

const matchUrlPrefix = 'https://bbs.pku.edu.cn/v2';
const prefixLength = matchUrlPrefix.length;

// 共4种屏蔽级别。
// 0代表不屏蔽。
// 1代表屏蔽所发的贴子。
// 2代表屏蔽发帖以及回帖。
// 3代表屏蔽发帖、回帖以及相关对话（别人对其的回帖）
const BLOCK_NONE = 0;
const BLOCK_THREAD = 1;
const BLOCK_POSTS = 2;
const BLOCK_ALL = 3;

const OP_NONE = 0;
const OP_HIDE = 1;
chrome.storage.sync.clear(() => {
  chrome.storage.sync.set({ 'flamefox': 3 });
});

function getMap(postsOrThreads) {
  return postsOrThreads.reduce((prev, { username, quoteUsername }) => {
    prev[username] = BLOCK_NONE;
    if (quoteUsername) {
      prev[quoteUsername] = BLOCK_NONE;
    }
    return prev;
  }, {});
}

function getOperationListFromPosts(posts, callback) {
  const storage = chrome.storage.sync.get(getMap(posts), (answers) => {
    const operations = posts.map(({ username, quoteUsername }) => {
      let op = OP_NONE;
      if (answers[username] >= BLOCK_POSTS) {
        op = OP_HIDE;
      }
      if (quoteUsername && answers[quoteUsername] >= BLOCK_ALL) {
        op = OP_HIDE;
      }
      return op;
    });
    callback(operations);
  });
}

function filterPosts(tabId) {
  chrome.tabs.sendMessage(tabId, { type: 'GET_POSTS' }, (posts) => {
    getOperationListFromPosts(posts, (operations) => {
      chrome.tabs.sendMessage(tabId, { type: 'FILTER_POSTS', operations });
    });
  });
}

function handleNavigation(e) {
  chrome.pageAction.show(e.tabId); // TODO
  const prefix = e.url.slice(prefixLength);
  if (prefix.startsWith('/post-read.php')) {
    filterPosts(e.tabId);
  }
}

chrome.webNavigation.onDOMContentLoaded.addListener(handleNavigation, {url: [{urlPrefix: matchUrlPrefix}]})

chrome.webNavigation.onHistoryStateUpdated.addListener(handleNavigation, {url: [{urlPrefix: matchUrlPrefix}]})