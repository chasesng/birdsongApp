import {ref} from 'vue';
import axios from 'axios';
import {auth} from '~/composables/auth';

const {currentUser} = auth();
const backendUrl = ref<string>('http://localhost:5000/api');

export function redis() {
    const getKey = async () => {
        try {
            const userId = currentUser.value?.user?.id;
            if (!userId) {
                return null;
            }
            const {data} = await axios.get(`${backendUrl.value}/key/${userId}`);
            return data;
        } catch (err) {
            console.error("Failed to fetch key:", err?.response?.data || err);
            return null;
        }
    };

    const setKey = async () => {
        try {
            console.log("setkey called");
            const userId = currentUser.value?.user?.id;
            if (!userId) {
                console.warn("setKey() called without a valid userId");
                return null;
            }
            const {data} = await axios.post(`${backendUrl.value}/setKey/${userId}`);
            return data;
            // Expected:
            // {
            //   success: true,
            //   userId: "240",
            //   value: 3
            // }

        } catch (err: any) {
            console.error("Failed to set key:", err?.response?.data || err);
            return null;

        }
    };

    return {
        getKey,
        setKey
    }
}