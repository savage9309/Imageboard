//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.9;
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Imageboard {
    IERC20 private bzzToken;
    bytes32[] private threadIds;

    mapping(bytes32 => Post) private posts;
    mapping(address => bytes32[]) private addressToThreads;
    mapping(address => bytes32[]) private addressToComments;
    mapping(address => bytes32) private addressToPostId;
    mapping(address => bytes32) private addressToBatchId;

    enum VoteType {
        NONE,
        UP,
        DOWN
    }
    enum PostType {
        THREAD,
        COMMENT
    }

    event ThreadCreated(bytes32 bzzhash);
    event ThreadUpdated(bytes32 bzzhash);
    event CommentUpdated(bytes32 bzzhash);
    event CommentCreated(bytes32 bzzhash);

    struct Post {
        bytes32 id;
        uint256 index;
        uint256 timestamp;
        address owner;
        bytes32 bzzhash;
        bytes32 threadBzzhash;
        bool exists;
        bytes32[] commentIds;
        int256 rating;
        PostType postType;
    }

    constructor(address bzzContractAddress) {
        bzzToken = IERC20(bzzContractAddress);
    }

    function getPaginatedThreadIds(uint256 _page, uint256 _resultsPerPage)
        external
        view
        returns (bytes32[] memory data)
    {
        /*
        ex: _page 1, _resultsPerPage 20 | 1 * 20 - 20 = 0
        ex2: _page 2, _resultsPerPage 20 | 2 * 20 - 20 = 20
        starting point for listing items in array
        */
        uint256 _index = _resultsPerPage * _page - _resultsPerPage;

        // return emptry array if already empty or _index is out of bounds
        if (threadIds.length == 0 || _index > threadIds.length) {
            return new bytes32[](0);
        }

        // need to create fixed length array because we cannot push to array in memory
        bytes32[] memory _bzzHashes = new bytes32[](_resultsPerPage);

        // start starting counter for return array
        uint256 _returnCounter = 0;

        // loop through array from starting point to end point
        for (_index; _index < _resultsPerPage * _page; _index++) {
            /*
            add array item unless out of bounds
            if so add uninitialized value (0 in the case of uint256)
            */
            if (_index < threadIds.length) {
                _bzzHashes[_returnCounter] = threadIds[_index];
            } else {
                _bzzHashes[_returnCounter] = 0;
            }
            _returnCounter++;
        }
        return _bzzHashes;
    }

    function createThread(bytes32 _threadBzzhash) public returns (bool succeed) {
        bytes32 threadId = keccak256(abi.encode(msg.sender, _threadBzzhash));

        posts[threadId] = Post({
            id: threadId,
            index: threadIds.length,
            timestamp: block.timestamp,
            owner: msg.sender,
            bzzhash: _threadBzzhash,
            threadBzzhash: _threadBzzhash,
            exists: true,
            commentIds: new bytes32[](0),
            rating: 0,
            postType: PostType.THREAD
        });

        threadIds.push(threadId);
        addressToThreads[msg.sender].push(threadId);
        emit ThreadCreated(threadId);
        return true;
    }

    function getThread(bytes32 _id) external view returns (Post memory) {
        Post storage thread = posts[_id];
        require(thread.exists, "thread doesn't exist");
        require(thread.postType == PostType.THREAD, "this is not a thread");
        return thread;
    }

    function getThreadIdsByAddress(address addr) public view returns (bytes32[] memory) {
        return addressToThreads[addr];
    }

    function getTotalThreads() public view returns (uint256) {
        return threadIds.length;
    }

    function createComment(bytes32 _id, bytes32 _commentBzzhash) public returns (bool succeed) {
        Post storage post = posts[_id];
        require(post.exists, "thread or comment doesn't exist");

        bytes32 commentId = keccak256(abi.encode(msg.sender, _commentBzzhash));

        posts[commentId] = Post({
            id: commentId,
            index: 0,
            timestamp: block.timestamp,
            owner: msg.sender,
            bzzhash: _commentBzzhash,
            threadBzzhash: post.postType == PostType.COMMENT ? post.threadBzzhash : post.bzzhash,
            exists: true,
            commentIds: new bytes32[](0),
            rating: 0,
            postType: PostType.COMMENT
        });

        post.commentIds.push(commentId);
        addressToComments[msg.sender].push(commentId);

        if (post.postType == PostType.COMMENT) {
            emit CommentUpdated(post.id);
        }
        if (post.postType == PostType.THREAD) {
            emit ThreadUpdated(post.id);
        }
        emit CommentCreated(commentId);

        return true;
    }

    function getComment(bytes32 _id) external view returns (Post memory) {
        Post storage comment = posts[_id];
        require(comment.exists, "comment doesn't exist");
        require(comment.postType == PostType.COMMENT, "this is not a comment");
        return comment;
    }

    function getCommentBzzHashesByAddress(address addr) public view returns (bytes32[] memory) {
        return addressToComments[addr];
    }

    function voteUp(bytes32 _id, uint _amount) public returns (bool succeed) {
        Post storage post = posts[_id];
        post.rating++;
        bzzToken.transferFrom(msg.sender, address(this), _amount);
        if (post.postType == PostType.COMMENT) {
            emit CommentUpdated(post.id);
        }
        if (post.postType == PostType.THREAD) {
            emit ThreadUpdated(post.id);
        }
        return true;
    }

    function voteDown(bytes32 _id) public returns (bool succeed) {
        Post storage post = posts[_id];
        post.rating--;
        if (post.postType == PostType.COMMENT) {
            emit CommentUpdated(post.id);
        }
        if (post.postType == PostType.THREAD) {
            emit ThreadUpdated(post.id);
        }
        return true;
    }

    function setBatchId(bytes32 _batchId) public returns (bool succeed) {
        addressToBatchId[msg.sender] = _batchId;
        return true;
    }

    function getBatchId() public view returns (bytes32 batchId) {
        return addressToBatchId[msg.sender];
    }


}
