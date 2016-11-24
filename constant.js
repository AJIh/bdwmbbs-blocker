// 共4种屏蔽级别。
// 0代表不屏蔽。
// 1代表屏蔽所发的贴子。
// 2代表屏蔽发帖以及回帖。
// 3代表屏蔽发帖、回帖以及相关对话（别人对其的回帖）
const BLOCK_NONE = 0;
const BLOCK_THREAD = 1;
const BLOCK_POSTS = 2;
const BLOCK_ALL = 3;

const levelName = {
  [BLOCK_NONE]: '未屏蔽',
  [BLOCK_THREAD]: '屏蔽发帖',
  [BLOCK_POSTS]: '屏蔽发帖、回帖',
  [BLOCK_ALL]: '屏蔽发帖、回帖、对话',
};

const OP_NONE = 0;
const OP_HIDE = 1;

const GET_POSTS = 'GET_POSTS';
const GET_THREADS = 'GET_THREADS';
const GET_USER = 'GET_USER';
const FILTER_ITEMS = 'FILTER_ITEMS';
const RENDER_USER = 'RENDER_USER';
const CHANGE_BLOCK_LEVEL = 'CHANGE_BLOCK_LEVEL';
