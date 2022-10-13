//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.17;
import "hardhat-deploy/solc_0.8/proxy/Proxied.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "../Libraries/AddrArrayLib.sol";

contract Imageboard is Proxied {
    using AddrArrayLib for AddrArrayLib.Addresses;
    using SafeMath for uint256;

    uint256 public bzzFee = 10**13;

    AddrArrayLib.Addresses userAddresses;

    ERC20 public bzzToken;
    bytes32[] private threadIds;

    mapping(bytes32 => Post) private posts;
    mapping(address => bytes32[]) private addressToThreadIds;
    mapping(address => bytes32[]) private addressToCommentIds;
    mapping(address => int256) private addressToSocialScore;

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

    constructor(address _bzzTokenAddress) {
        bzzToken = ERC20(_bzzTokenAddress);
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

        if (userAddresses.size() > 0) {
            uint256 fee = getFee(msg.sender);
            address lotteryWinner = randomUser();
            require(bzzToken.transferFrom(msg.sender, lotteryWinner, fee), "failed transfer");
        }

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
        addressToThreadIds[msg.sender].push(threadId);
        userAddresses.pushAddress(msg.sender);
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
        return addressToThreadIds[addr];
    }

    function getTotalThreads() public view returns (uint256) {
        return threadIds.length;
    }

    function createComment(bytes32 _id, bytes32 _commentBzzhash) public returns (bool succeed) {
        Post storage post = posts[_id];
        require(post.exists, "thread or comment doesn't exist");
        bytes32 commentId = keccak256(abi.encode(msg.sender, _commentBzzhash));

        uint256 fee = getFee(msg.sender);
        uint256 win = fee.div(2);
        address postOwner = post.owner;
        address lotteryWinner = randomUser();
        require(bzzToken.transferFrom(msg.sender, lotteryWinner, win), "failed transfer");
        require(bzzToken.transferFrom(msg.sender, postOwner, win), "failed transfer");

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
        addressToCommentIds[msg.sender].push(commentId);
        userAddresses.pushAddress(msg.sender);
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

    function getCommentIdsByAddress(address addr) public view returns (bytes32[] memory) {
        return addressToCommentIds[addr];
    }

    function upVote(bytes32 _id) public returns (bool succeed) {
        Post storage post = posts[_id];
        require(post.exists, "thread or comment doesn't exist");

        uint256 fee = getFee(msg.sender);
        uint256 win = fee.div(2);
        address postOwner = post.owner;
        address lotteryWinner = randomUser();
        require(bzzToken.transferFrom(msg.sender, lotteryWinner, win), "failed transfer");
        require(bzzToken.transferFrom(msg.sender, postOwner, win), "failed transfer");

        post.rating++;
        addressToSocialScore[post.owner]++;
        if (post.postType == PostType.COMMENT) {
            emit CommentUpdated(post.id);
        }
        if (post.postType == PostType.THREAD) {
            emit ThreadUpdated(post.id);
        }
        return true;
    }

    function downVote(bytes32 _id) public returns (bool succeed) {
        Post storage post = posts[_id];
        require(post.exists, "thread or comment doesn't exist");

        uint256 fee = getFee(msg.sender);
        uint256 win = fee.div(2);
        address postOwner = post.owner;
        address lotteryWinner = randomUser();
        require(bzzToken.transferFrom(msg.sender, lotteryWinner, win), "failed transfer");
        require(bzzToken.transferFrom(msg.sender, postOwner, win), "failed transfer");

        post.rating--;
        addressToSocialScore[post.owner]--;
        if (post.postType == PostType.COMMENT) {
            emit CommentUpdated(post.id);
        }
        if (post.postType == PostType.THREAD) {
            emit ThreadUpdated(post.id);
        }
        return true;
    }

    function getSocialScore(address addr) public view returns (int256) {
        return addressToSocialScore[addr];
    }

    function getFee(address addr) public view returns (uint256 fee) {
        int256 socialScore = addressToSocialScore[addr];
        uint256 multiplier = getMultiplier(socialScore);
        return bzzFee * multiplier;
    }

    function getMultiplier(int256 socialScore) public pure returns (uint256 fee) {
        if (socialScore >= 2) {
            return 1;
        }
        if (socialScore >= 1) {
            return 2;
        }
        if (socialScore >= 0) {
            return 3;
        }
        if (socialScore >= -1) {
            return 4;
        }
        if (socialScore >= -2) {
            return 5;
        }
    }

    function totalUsers() public view returns (uint256) {
        return userAddresses.size();
    }

    function randomUser() public view returns (address) {
        uint256 randomUserIndex = randomNumber(userAddresses.size());
        address randomUserAddr = userAddresses.getAddressAtIndex(randomUserIndex);
        return randomUserAddr;
    }

    function randomNumber(uint256 number) internal view returns (uint256) {
        return uint256(blockhash(block.number - 1)) % number;
    }
}
