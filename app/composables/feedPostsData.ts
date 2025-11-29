import {ref} from 'vue';
import {redis} from '~/composables/redis';
import {supabase} from '../supabaseClient';
import {auth} from './auth';

import axios from 'axios';
import {useSessionStorage} from '@vueuse/core';

const {getKey, setKey} = redis();
const {userAttributes, currentUser} = auth();

interface user {
    id?: number,
    created_at?: string,
    email?: string,
    usernameID?: string,
    authUID?: string,
    profileColor?: string
    displayName?: string,
    degree?: string,
    alumni?: boolean
}

interface posts {
    id: number,
    courseId?: number,
    created_at: string,
    pUserId?: number,
    pUserProfilePic?: string,
    pContent?: string,
    users?: user
}

export interface createPostTemplate {
    pContent: string,
    postType: string,
    userAuthUID: string
}


export function feedPostData() {
    const currentPostIndex = useSessionStorage<number>('currentPostIndex', -1);
    const posts = useSessionStorage<posts[]>('posts', []);
    const loading = ref<boolean>(false);
    const singleUser = useSessionStorage<user>('latestUser', {} as any)
    const totalPostCount = useSessionStorage<number>('tpc', 0)
    const singleUserPosts = useSessionStorage<posts[]>('userposts', [])
    const nextBefore = ref<string | null>(null);
    const populatePosts = async () => {
        const {data, error} = await supabase.rpc(`get_posts_with_users`);
        posts.value = data ?? [];
    }

    const createPost = async (post) => {
        try {

            const formData = new FormData();
            formData.append('text', post.pContent.trim());
            formData.append('postType', post.postType);
            formData.append('hasImage', post.hasImage ? 'true' : 'false');

            if (post.hasImage && post.file) {
                formData.append('file', post.file);
            }



            const response = await axios.post(
                'https://c8yjgte58i.execute-api.ap-southeast-1.amazonaws.com/default/',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${post.token}`,
                    },
                }
            );

            return response.data;

        } catch (err) {
            console.error("Error creating post:", err);
            throw err;
        }
    };



    const getSinglePost = async (postId: number, force: boolean = false) => {
        // Try to find post already in reactive array
        if (!force) {
            const existingPost = posts.value.find(p => p.post_id === Number(postId));
            if (existingPost) return existingPost;
        }

        const {data, error} = await supabase.rpc('get_post_by_id', {
            p_post_id: postId,
            p_current_user_auth_uid: currentUser.value?.user?.id
        });
        console.log(currentPostIndex.value);
        // return data[0]; // ensure it returns same shape as posts.value
        if (data) {
            console.log("Updating current post")
            posts.value[currentPostIndex.value] = data[0];
            //overwrite
        }
    };

    const getPostComments = async (postId: number) => {
        const {data, error} = await supabase
            .from('comments').select('*, users(id, email, usernameID, displayName, profileColor)').eq('postId', postId).order('created_at', {ascending: true})
        return data;
    }

    const submitComment = async (postId: number, cContent: string) => {
        if (currentUser.value?.user?.id) {
            const {data, error} = await supabase
                .rpc('comment_post', {
                    p_post_id: postId,
                    p_user_id: currentUser.value?.user.id,
                    ccontent: String(cContent).trim(), //for some reason it lowercases the params

                })
            console.log(error);
        } else {
            console.log("No user detected, failed to submit comment.")
        }
        return;
    }

    const editComment = async (commentId: number, cContent: string) => {
        if (userAttributes.value?.id) {
            try {
                const {data, error} = await supabase.from('comments').update({
                    cContent: cContent,
                    edited: true
                }).eq('id', commentId);
            } catch (error) {
                console.error("Error updating comment:", error);
            }
        }

    }

    const likePost = async (postId: number) => {
        const authUID = currentUser.value?.user?.id;
        if (!authUID) throw new Error("No authUID");

        const {data, error} = await supabase.rpc('like_post', {
            p_post_id: postId,
            p_user_id: String(authUID),
        });

        if (error) throw error;

        return data;
    };

    const unlikePost = async (postId: number) => {
        const authUID = currentUser.value?.user?.id;
        if (!authUID) throw new Error("No authUID");

        const {data, error} = await supabase.rpc('remove_likes', {
            p_post_id: postId,
            p_user_auth_uid: String(authUID),
        });

        if (error) throw error;

        return data;
    };

    const toggleLike = async (post) => {
        const originallyLiked = post.has_liked;
        post.has_liked = !originallyLiked;
        post.likes_count += post.has_liked ? 1 : -1;

        try {
            await (post.has_liked ? likePost(post.post_id) : unlikePost(post.post_id));
        } catch (err) {
            // rollback
            post.has_liked = originallyLiked;
            post.likes_count += originallyLiked ? 1 : -1;
        }
    };
    const fetchLikeData = async (postId: number) => {
        // expected return to have col1: likes_count, col2: whether user likes
        if (userAttributes) {
            try {
                const {count: totalLikes, error: countError} = await supabase
                    .from('likes')
                    .select('*', {count: 'exact', head: true})
                    .eq('postId', postId);

                const {data: userLike, error: userLikeError} = await supabase
                    .from('likes')
                    .select('id')
                    .eq('postId', postId)
                    .eq('userAuthUID', userAttributes.value.authUID)
                    .maybeSingle();

                const userLiked = !!userLike;
                return [totalLikes, userLiked];
            } catch (err) {
                console.error(err);
            }
        }
    }

    const getUser = async (usernameId: string) => {
        if ((singleUser.value as any).usernameID === usernameId) {
            return;
        }
        try {
            const {data, error} = await supabase.from('users').select('*').eq('usernameID', usernameId).maybeSingle();
            singleUser.value = data
        } catch (err) {
            console.error(err);
        }
    }

    const getUserPosts = async (userAuthUID: string) => {
        try {
            const {data, error} = await supabase.from('posts').select('*').eq('userAuthUID', String(userAuthUID));
            singleUserPosts.value = data ?? [];
        } catch (err) {
            console.error(err)
        }

    }

    const mergePostsUnique = (incoming: posts[], prepend = false) => {
        const existingIds = new Set(posts.value.map((p) => p.post_id));
        const unique = incoming.filter((p) => !existingIds.has(p.post_id));
        if (prepend) posts.value = [...unique, ...posts.value];
        else posts.value = [...posts.value, ...unique];
        if (unique.length > 0) {
            // update nextBefore to the created_at of the last post
            nextBefore.value = posts.value[posts.value.length - 1].created_at;
        }
    };


    const fetchPosts = async (authUID: string | null, limit = 20) => {
        if (loading.value) return;
        loading.value = true;

        try {
            const API_BASE = "https://e7qia0cw71.execute-api.ap-southeast-1.amazonaws.com/default/";
            const response = await axios.get(API_BASE, {
                params: {
                    authUID,
                    limit,
                    before: nextBefore.value, // keyset anchor
                },
            });

            const incoming: posts[] = response.data?.posts ?? [];
            mergePostsUnique(incoming, false); // appends older posts
        } catch (err) {
            console.error("Failed to fetch posts:", err);
        } finally {
            loading.value = false;
        }
    };

    const fetchNewPosts = async (authUID: string | null) => {
        if (loading.value) return;
        loading.value = true;

        try {
            const latestCreated = posts.value?.[0]?.created_at ?? null;
            const API_BASE = "https://e7qia0cw71.execute-api.ap-southeast-1.amazonaws.com/default/";

            const response = await axios.get(API_BASE, {
                params: {
                    authUID,
                    since_id: latestCreated,
                },
            });

            const incoming: posts[] = response.data?.posts ?? [];
            mergePostsUnique(incoming, true); // prepend newer posts
        } catch (err) {
            console.error("Failed to fetch new posts:", err);
        } finally {
            loading.value = false;
        }
    };


    const checkPostsCount = async () => {
        try {
            const {data, count, error} = await supabase
                .from("posts")
                .select("id", {count: "exact", head: true});

            if (error) {
                console.error(error);
                return;
            }
            totalPostCount.value = count ?? 0;
        } catch (err) {
            console.error(err);
        }
    };

    const deletePost = async (post: object) => {
        console.log("Deleting post:", post);
        console.log(userAttributes.value?.usernameID);
        if (post?.usernameid === userAttributes.value?.usernameID) {
            console.log("Successfully deleting post:", post);
            const {data, error} = await supabase.from('posts').delete().eq('id', post?.post_id)
            if (!error) {
                return 1
            }
        } else {
            console.log("Failed to validate post deletion.")
        }

    }

    return {
        posts,
        singleUser,
        singleUserPosts,
        totalPostCount,
        loading,
        nextBefore,

        currentPostIndex,
        fetchPosts,
        fetchNewPosts,
        populatePosts,
        likePost,
        unlikePost,
        fetchLikeData,
        createPost,
        getSinglePost,
        getPostComments,
        submitComment,
        editComment,
        getUser,
        getUserPosts,
        checkPostsCount,
        mergePostsUnique,
        deletePost
    }
}
