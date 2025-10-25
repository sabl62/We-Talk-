import User from "../models/user.model.js";

// ✅ Send a friend request
export const sendFriendRequest = async (req, res) => {
    const fromUserId = req.user._id;
    const { toUserId } = req.params;

    if (fromUserId.equals(toUserId))
        return res.status(400).json({ message: "You can't add yourself." });

    const fromUser = await User.findById(fromUserId);
    const toUser = await User.findById(toUserId);

    if (!toUser) return res.status(404).json({ message: "User not found." });
    if (fromUser.friends.includes(toUserId))
        return res.status(400).json({ message: "Already friends." });
    if (toUser.friendRequestsReceived.includes(fromUserId))
        return res.status(400).json({ message: "Request already sent." });

    toUser.friendRequestsReceived.push(fromUserId);
    fromUser.friendRequestsSent.push(toUserId);

    await fromUser.save();
    await toUser.save();

    res.status(200).json({ message: "Friend request sent." });
};

// ✅ Accept a friend request
export const acceptFriendRequest = async (req, res) => {
    const userId = req.user._id;
    const { fromUserId } = req.params;

    const user = await User.findById(userId);
    const fromUser = await User.findById(fromUserId);

    if (!user || !fromUser)
        return res.status(404).json({ message: "User not found." });

    // Remove request and add as friends
    user.friendRequestsReceived = user.friendRequestsReceived.filter(
        (id) => !id.equals(fromUserId)
    );
    fromUser.friendRequestsSent = fromUser.friendRequestsSent.filter(
        (id) => !id.equals(userId)
    );

    user.friends.push(fromUserId);
    fromUser.friends.push(userId);

    await user.save();
    await fromUser.save();

    res.status(200).json({ message: "Friend request accepted." });
};

// ✅ Get all friends (for sidebar)
export const getFriends = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).populate("friends", "-password");
        res.status(200).json(user.friends);
    } catch (error) {
        res.status(500).json({ message: "Failed to load friends" });
    }
};

// ✅ Get pending friend requests
export const getFriendRequests = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate("friendRequestsReceived", "fullName profilePic");
        res.status(200).json(user.friendRequestsReceived);
    } catch (error) {
        console.error("Error fetching friend requests:", error);
        res.status(500).json({ message: error.message });
    }
};

// ✅ Get pending friend requests
export const getPendingRequests = async (req, res) => {
    const userId = req.user._id;
    const user = await User.findById(userId)
        .populate("friendRequestsReceived", "fullName profilePic")
        .select("friendRequestsReceived");
    res.status(200).json(user.friendRequestsReceived);
};
