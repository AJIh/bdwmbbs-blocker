let currentTab;

const matchUrlPrefix = 'https://bbs.pku.edu.cn/v2';
const prefixLength = matchUrlPrefix.length;

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

function getOperationListFromThreads(threads, callback) {
  const storage = chrome.storage.sync.get(getMap(threads), (answers) => {
    const operations = threads.map(({ username }) => {
      let op = OP_NONE;
      if (answers[username] >= BLOCK_THREAD) {
        op = OP_HIDE;
      }
      return op;
    });
    callback(operations);
  });
}

function filterPosts(tabId) {
  chrome.tabs.sendMessage(tabId, { type: GET_POSTS }, (posts) => {
    getOperationListFromPosts(posts, (operations) => {
      chrome.tabs.sendMessage(tabId, { type: FILTER_ITEMS, operations });
    });
  });
}

function filterThreads(tabId) {
  chrome.tabs.sendMessage(tabId, { type: GET_THREADS }, (threads) => {
    getOperationListFromThreads(threads, (operations) => {
      chrome.tabs.sendMessage(tabId, { type: FILTER_ITEMS, operations });
    });
  });
}

function renderUserPage(tabId) {
  chrome.tabs.sendMessage(tabId, { type: GET_USER }, (username) => {
    chrome.storage.sync.get({ [username]: 0 }, (answer) => {
      chrome.tabs.sendMessage(tabId, { type: RENDER_USER, blockLevel: answer[username] });
    });
  });
}

function handleNavigation(e) {
  chrome.pageAction.show(e.tabId); // TODO
  const prefix = e.url.slice(prefixLength);
  if (prefix.startsWith('/post-read.php')) {
    filterPosts(e.tabId);
  } else if (prefix.startsWith('/thread.php') || prefix.startsWith('/hot-topic.php')) {
    filterThreads(e.tabId);
  } else if (prefix.startsWith('/user.php')) {
    renderUserPage(e.tabId);
  }
}

chrome.webNavigation.onDOMContentLoaded.addListener(handleNavigation, {url: [{urlPrefix: matchUrlPrefix}]});

chrome.webNavigation.onHistoryStateUpdated.addListener(handleNavigation, {url: [{urlPrefix: matchUrlPrefix}]});

function changeBlockLevel({ username, blockLevel }) {
  if (blockLevel === BLOCK_NONE) {
    chrome.storage.sync.remove(username);
  } else {
    chrome.storage.sync.set({ [username]: blockLevel });
  }
}

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    switch (request.type) {
      case CHANGE_BLOCK_LEVEL: {
        changeBlockLevel(request);
        break;
      }
      default:
    }
  }
);
