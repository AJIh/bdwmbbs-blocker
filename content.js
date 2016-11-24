const OP_NONE = 0;
const OP_HIDE = 1;

const GET_POSTS = 'GET_POSTS';
const GET_THREADS = 'GET_THREADS';
const FILTER_ITEMS = 'FILTER_ITEMS';

let DOMItems;
function retrievePostsFromDOM() {
  DOMItems = document.querySelectorAll('.post-card');
  return [...DOMItems].map(postDOM => { // 必须使用...语法，因为posts是NodeList
    const usernameContainer = postDOM.querySelector('.username > a');
    const username = usernameContainer.textContent;
    const quoteHead = postDOM.querySelector('.quotehead');
    const quoteUsername = quoteHead ? quoteHead.dataset.username : null;
    return { username, quoteUsername };
  });
}

function retrieveThreadsFromDOM() {
  DOMItems = document.querySelectorAll('.list-item');
  return [...DOMItems].map(threadDOM => { // 必须使用...语法，因为posts是NodeList
    const usernameContainer = threadDOM.querySelector('.author > .name');
    const username = usernameContainer.textContent;
    return { username };
  });
}

function hideSpecifiedItems(operations) {
  operations.forEach((op, index) => {
    if (op === OP_HIDE) {
      DOMItems.item(index).style.display = 'none';
    }
  });
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    switch (request.type) {
      case GET_POSTS: {
        const posts = retrievePostsFromDOM();
        sendResponse(posts);
        break;
      }
      case GET_THREADS: {
        const threads = retrieveThreadsFromDOM();
        sendResponse(threads);
        break;
      }
      case FILTER_ITEMS:
        hideSpecifiedItems(request.operations);
        break;
      default:
    }
  }
);
//
// document.addEventListener('DOMContentLoaded', hideSpecifiedPosts, false);
// window.addEventListener('transitionend', hideSpecifiedPosts, false);
