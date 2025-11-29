import {ref} from 'vue';
import {supabase} from '../supabaseClient';

interface schoolObject {
    id: number
    schoolName: string,
    imageURL: string
}

export function professorData() {
    const schools = ref<schoolObject[]>([])

    const getSchools = async () => {
        const {data, error} = await supabase.from('schools').select('id, schoolName, imageURL');
        schools.value = (data ?? []) as schoolObject[];
    }


    return {
        schools,
        getSchools
    }
}