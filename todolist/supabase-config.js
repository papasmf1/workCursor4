// Supabase 설정
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Supabase 클라이언트 초기화
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 데이터베이스 테이블 이름
const TODOS_TABLE = 'todos';

// Supabase 연동 함수들
const SupabaseService = {
    // 할일 목록 가져오기
    async getTodos() {
        try {
            const { data, error } = await supabase
                .from(TODOS_TABLE)
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('할일 목록 가져오기 오류:', error);
            return [];
        }
    },

    // 할일 추가
    async addTodo(todo) {
        try {
            const { data, error } = await supabase
                .from(TODOS_TABLE)
                .insert([{
                    text: todo.text,
                    completed: todo.completed,
                    created_at: todo.createdAt
                }])
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('할일 추가 오류:', error);
            throw error;
        }
    },

    // 할일 업데이트
    async updateTodo(id, updates) {
        try {
            const { data, error } = await supabase
                .from(TODOS_TABLE)
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('할일 업데이트 오류:', error);
            throw error;
        }
    },

    // 할일 삭제
    async deleteTodo(id) {
        try {
            const { error } = await supabase
                .from(TODOS_TABLE)
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('할일 삭제 오류:', error);
            throw error;
        }
    }
};

// 전역으로 내보내기
window.SupabaseService = SupabaseService;
