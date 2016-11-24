let currentTab;

const matchUrlPrefix = 'https://bbs.pku.edu.cn/v2';
const prefixLength = matchUrlPrefix.length;

function getOperationListFromPosts(posts) {
  return posts.map(post => {
    return {
      hide: true,
    };
  });
}

function filterPosts(tabId) {
  chrome.tabs.sendMessage(tabId, { type: 'GET_POSTS' }, ({ posts }) => {
    const operations = getOperationListFromPosts(posts);
    chrome.tabs.sendMessage(tabId, { type: 'FILTER_POSTS', operations });
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
