import axios from "axios";
import { setAlert } from "./alert";
import { loadUser } from "./auth";

import {
  GET_SEARCHED_POSTS,
  GET_POSTS,
  POST_ERROR,
  UPDATE_LIKES,
  UPDATE_INTEREST,
  DELETE_POST,
  ADD_POST,
  GET_POST,
  UPDATE_ASSIGNED,
  ADD_COMMENT,
  REMOVE_COMMENT,
  UPDATE_STATUS,
  GET_NOTIFICATION,
  DELETE_NOTIFICATION,
  GET_PROFILES,
  PROFILE_ERROR,
  CLEAR_PROFILE,

} from "./types";


// Get posts
export const getPosts = () => async dispatch => {
  try {
    const res = await axios.get("/api/posts");

    dispatch({
      type: GET_POSTS,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

// Get posts of user
export const getUserPosts = id => async dispatch => {
  try {
    const res = await axios.get(`/api/posts/user/${id}`);

    dispatch({
      type: GET_POSTS,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};



// Search post by title
export const getPostsSearch = title => async dispatch => {
  try {
    console.log(title);
    const res = await axios.get(`/api/posts/search/${title}`);

    dispatch({
      type: GET_SEARCHED_POSTS,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

// Get notification of post
export const getNotification = () => async dispatch => {
 // dispatch({ type: CLEAR_PROFILE });

  try {
    const res = await axios.get("/api/profile/notification");

    dispatch({
      type: GET_POSTS,
      payload: res.data
    });
  } catch (err) {
    console.log(err)
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};


// Delete notification of post
export const deleteNotification = id => async dispatch => {
  try{
    await axios.delete(`/api/profile/deleteNotification/${id}`);
    dispatch({
      type: DELETE_NOTIFICATION,
      payload: id
    });
    dispatch(setAlert("Notification Removed", "success"));
  } catch (err) {
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }

};



// Add Interest
export const addInterested = (postId, userId) => async dispatch => {
  //console.log("action interest" , userId);
  try {
    const res = await axios.put(`/api/posts/interest/${postId}/${userId}`);

    dispatch({
      type: UPDATE_INTEREST,
      payload: { postId, interest: res.data }
    });
  } catch (err) {
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

//Get Interests

export const getInterest = (id) => async dispatch => {
  dispatch({ type: CLEAR_PROFILE });

  console.log("post id", id);
  try {
    const res = await axios.get(`api/posts/interests/${id}`);

    dispatch({
      type: GET_PROFILES,
      payload: res.data
    });

    
  } catch (err) {
    console.log(err);
   // dispatch({
     // type: PROFILE_ERROR,
     // payload: { msg: err.response.statusText, status: err.response.status }
    //});
  }

};


//Assign user for project
export const assignTradesperson = (id) => async dispatch => {
  console.log("ASSIGN ID", id);
  try {
    
    const res = await axios.put(`/api/posts/assign/${id}`);

    //var search = id;
    //var para = search.split(",");

    //var arr = para.map(ele => ele);
    //var id_ = arr[0];
    dispatch({
      type: UPDATE_ASSIGNED,
      payload: { id, assigned: res.data }
    });
  } catch (err) {
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};


export const updateStatus = id => async dispatch => {
  try {

    const res = await axios.put(`/api/posts/status/${id}`);

    var search = id;
    var para = search.split(",");

    var arr = para.map(ele => ele);
    var id_ = arr[0];
    dispatch({
      type: UPDATE_STATUS,
      payload: { id_, status: res.data }
    });
  } catch (err) {
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};



// Add like
export const addLike = id => async dispatch => {
  try {
    const res = await axios.put(`/api/posts/like/${id}`);

    dispatch({
      type: UPDATE_LIKES,
      payload: { id, likes: res.data }
    });
  } catch (err) {
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};


// Remove like
export const removeLike = id => async dispatch => {
  try {
    const res = await axios.put(`/api/posts/unlike/${id}`);

    dispatch({
      type: UPDATE_LIKES,
      payload: { id, likes: res.data }
    });
  } catch (err) {
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

// Delete post
export const deletePost = id => async dispatch => {
  try {
    await axios.delete(`/api/posts/${id}`);
    console.log("at delete");
    dispatch({
      type: DELETE_POST,
      payload: id
    });

    dispatch(setAlert("Post Removed", "success"));
  } catch (err) {
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

// Add post
export const addPost = formData => async dispatch => {
  const config = {
    headers: {
      "Content-Type": "application/json"
    }
  };

  try {
    const res = await axios.post("/api/posts", formData, config);

    dispatch({
      type: ADD_POST,
      payload: res.data
    });

    dispatch(setAlert("Post Created", "success"));
  } catch (err) {
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

// Get post
export const getPost = id => async dispatch => {
  try {
    const res = await axios.get(`/api/posts/${id}`);

    dispatch({
      type: GET_POST,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

// Add comment
export const addComment = (postId, formData) => async dispatch => {
  const config = {
    headers: {
      "Content-Type": "application/json"
    }
  };

  try {
    const res = await axios.post(
      `/api/posts/comment/${postId}`,
      formData,
      config
    );

    dispatch({
      type: ADD_COMMENT,
      payload: res.data
    });

    dispatch(setAlert("Comment Added", "success"));
  } catch (err) {
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

// Delete comment
export const deleteComment = (postId, commentId) => async dispatch => {
  try {
    await axios.delete(`/api/posts/comment/${postId}/${commentId}`);

    dispatch({
      type: REMOVE_COMMENT,
      payload: commentId
    });

    dispatch(setAlert("Comment Removed", "success"));
  } catch (err) {
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};


