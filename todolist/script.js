// Todo App JavaScript - Supabase 연동
class TodoApp {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.isSupabaseReady = false;
        this.init();
    }

    // 초기화
    async init() {
        this.bindEvents();
        await this.loadTodos();
        this.render();
        this.updateStats();
    }

    // 이벤트 바인딩
    bindEvents() {
        const todoInput = document.getElementById('todo-input');
        const addBtn = document.getElementById('add-btn');
        const filterBtns = document.querySelectorAll('.filter-btn');
        const searchInput = document.getElementById('search-input');
        const clearCompletedBtn = document.getElementById('clear-completed');
        const exportBtn = document.getElementById('export-btn');
        const importBtn = document.getElementById('import-btn');
        const importInput = document.getElementById('import-input');

        // 할일 추가 이벤트
        todoInput.addEventListener('input', (e) => {
            addBtn.disabled = e.target.value.trim() === '';
        });

        todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !addBtn.disabled) {
                this.addTodo();
            }
        });

        addBtn.addEventListener('click', () => {
            this.addTodo();
        });

        // 필터 버튼 이벤트
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // 검색 이벤트
        searchInput.addEventListener('input', (e) => {
            this.searchTodos(e.target.value);
        });

        // 일괄 작업 이벤트
        clearCompletedBtn.addEventListener('click', () => {
            this.clearCompletedTodos();
        });

        exportBtn.addEventListener('click', () => {
            this.exportTodos();
        });

        importBtn.addEventListener('click', () => {
            importInput.click();
        });

        importInput.addEventListener('change', (e) => {
            this.importTodos(e.target.files[0]);
        });
    }

    // 할일 추가
    async addTodo() {
        const input = document.getElementById('todo-input');
        const prioritySelect = document.getElementById('priority-select');
        const text = input.value.trim();

        if (text === '') return;

        const todo = {
            text: text,
            completed: false,
            priority: prioritySelect.value,
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(todo);
        this.saveTodos();
        this.render();
        this.updateStats();

            // 입력 필드 초기화
            input.value = '';
            document.getElementById('add-btn').disabled = true;
            input.focus();
        } catch (error) {
            console.error('할일 추가 실패:', error);
            alert('할일 추가에 실패했습니다. 다시 시도해주세요.');
        }
    }

    // 할일 삭제
    async deleteTodo(id) {
        try {
            if (this.isSupabaseReady) {
                await SupabaseService.deleteTodo(id);
            }
            
            this.todos = this.todos.filter(todo => todo.id !== id);
            
            if (!this.isSupabaseReady) {
                this.saveTodos();
            }
            
            this.render();
            this.updateStats();
        } catch (error) {
            console.error('할일 삭제 실패:', error);
            alert('할일 삭제에 실패했습니다. 다시 시도해주세요.');
        }
    }

    // 할일 완료 상태 토글
    async toggleTodo(id) {
        const todo = this.todos.find(todo => todo.id === id);
        if (todo) {
            const newCompleted = !todo.completed;
            
            try {
                if (this.isSupabaseReady) {
                    await SupabaseService.updateTodo(id, { completed: newCompleted });
                }
                
                todo.completed = newCompleted;
                
                if (!this.isSupabaseReady) {
                    this.saveTodos();
                }
                
                this.render();
                this.updateStats();
            } catch (error) {
                console.error('할일 상태 변경 실패:', error);
                alert('할일 상태 변경에 실패했습니다. 다시 시도해주세요.');
            }
        }
    }

    // 필터 설정
    setFilter(filter) {
        this.currentFilter = filter;
        
        // 필터 버튼 활성화 상태 업데이트
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

        this.render();
    }

    // 필터링된 할일 목록 가져오기
    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(todo => !todo.completed);
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            default:
                return this.todos;
        }
    }

    // 할일 목록 렌더링
    render() {
        const container = document.querySelector('.todos-container');
        const filteredTodos = this.getFilteredTodos();

        if (filteredTodos.length === 0) {
            this.renderEmptyState(container);
            return;
        }

        container.innerHTML = '';
        filteredTodos.forEach(todo => {
            const todoElement = this.createTodoElement(todo);
            container.appendChild(todoElement);
        });
    }

    // 빈 상태 렌더링
    renderEmptyState(container) {
        let message = '';
        let emoji = '📝';
        switch (this.currentFilter) {
            case 'active':
                message = '미완료된 할일이 없습니다.';
                emoji = '✅';
                break;
            case 'completed':
                message = '완료된 할일이 없습니다.';
                emoji = '🎯';
                break;
            default:
                message = '아직 할일이 없습니다.<br>새로운 할일을 추가해보세요!';
                emoji = '✨';
        }

        container.innerHTML = `
            <div class="empty-state text-center py-12">
                <div class="text-6xl mb-4 floating">${emoji}</div>
                <h3 class="text-lg font-semibold mb-2 text-gray-700">${this.currentFilter === 'all' ? '할일이 없습니다' : '해당하는 할일이 없습니다'}</h3>
                <p class="text-gray-500">${message}</p>
            </div>
        `;
    }

    // 할일 요소 생성
    createTodoElement(todo) {
        const template = document.getElementById('todo-template');
        const clone = template.content.cloneNode(true);
        
        const todoItem = clone.querySelector('.todo-item');
        const checkbox = clone.querySelector('.checkbox');
        const todoText = clone.querySelector('.todo-text');
        const priorityBadge = clone.querySelector('.priority-badge');
        const createdAt = clone.querySelector('.created-at');
        const editBtn = clone.querySelector('.edit-btn');
        const deleteBtn = clone.querySelector('.delete-btn');

        // 할일 텍스트 설정
        todoText.textContent = todo.text;

        // 우선순위 설정
        const priorityConfig = {
            high: { text: '높음', class: 'bg-red-100 text-red-700' },
            medium: { text: '보통', class: 'bg-yellow-100 text-yellow-700' },
            low: { text: '낮음', class: 'bg-green-100 text-green-700' }
        };
        
        const priority = priorityConfig[todo.priority] || priorityConfig.medium;
        priorityBadge.textContent = priority.text;
        priorityBadge.className = `priority-badge px-2 py-1 rounded-full text-xs font-medium ${priority.class}`;

        // 생성일 설정
        const date = new Date(todo.createdAt);
        createdAt.textContent = date.toLocaleDateString('ko-KR', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // 완료 상태 설정
        checkbox.checked = todo.completed;
        if (todo.completed) {
            todoItem.classList.add('completed');
        }

        // 이벤트 리스너 추가
        checkbox.addEventListener('change', () => {
            this.toggleTodo(todo.id);
        });

        editBtn.addEventListener('click', () => {
            this.editTodo(todo.id);
        });

        deleteBtn.addEventListener('click', () => {
            this.deleteTodo(todo.id);
        });

        // 애니메이션 추가
        todoItem.style.opacity = '0';
        todoItem.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            todoItem.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            todoItem.style.opacity = '1';
            todoItem.style.transform = 'translateY(0)';
        }, 10);

        return clone;
    }

    // 통계 업데이트
    updateStats() {
        const totalTodos = this.todos.length;
        const completedTodos = this.todos.filter(todo => todo.completed).length;
        const completionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

        const totalElement = document.getElementById('total-todos');
        const completedElement = document.getElementById('completed-todos');
        const rateElement = document.getElementById('completion-rate');

        // 애니메이션 효과 추가
        [totalElement, completedElement, rateElement].forEach(el => {
            el.classList.add('updated');
            setTimeout(() => el.classList.remove('updated'), 600);
        });

        totalElement.textContent = totalTodos;
        completedElement.textContent = completedTodos;
        rateElement.textContent = `${completionRate}%`;
    }

    // 할일 로드 (Supabase 또는 로컬 스토리지)
    async loadTodos() {
        try {
            // Supabase 설정이 있는지 확인
            if (typeof SupabaseService !== 'undefined' && 
                SUPABASE_URL !== 'YOUR_SUPABASE_URL' && 
                SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY') {
                
                this.isSupabaseReady = true;
                this.todos = await SupabaseService.getTodos();
                console.log('Supabase에서 할일을 로드했습니다.');
            } else {
                // Supabase 설정이 없으면 로컬 스토리지 사용
                this.isSupabaseReady = false;
                const stored = localStorage.getItem('todolist-todos');
                this.todos = stored ? JSON.parse(stored) : [];
                console.log('로컬 스토리지에서 할일을 로드했습니다.');
            }
        } catch (error) {
            console.error('할일 로드 중 오류 발생:', error);
            // 오류 발생 시 로컬 스토리지로 폴백
            this.isSupabaseReady = false;
            const stored = localStorage.getItem('todolist-todos');
            this.todos = stored ? JSON.parse(stored) : [];
        }
    }

    // 로컬 스토리지에 할일 저장
    saveTodos() {
        try {
            localStorage.setItem('todolist-todos', JSON.stringify(this.todos));
        } catch (error) {
            console.error('할일 저장 중 오류 발생:', error);
        }
    }

    // 모든 할일 삭제 (개발용)
    clearAllTodos() {
        if (confirm('모든 할일을 삭제하시겠습니까?')) {
            this.todos = [];
            this.saveTodos();
            this.render();
            this.updateStats();
        }
    }

    // 완료된 할일만 삭제
    clearCompletedTodos() {
        const completedCount = this.todos.filter(todo => todo.completed).length;
        if (completedCount === 0) {
            alert('완료된 할일이 없습니다.');
            return;
        }

        if (confirm(`완료된 ${completedCount}개의 할일을 삭제하시겠습니까?`)) {
            this.todos = this.todos.filter(todo => !todo.completed);
            this.saveTodos();
            this.render();
            this.updateStats();
        }
    }

    // 할일 검색 (추가 기능)
    searchTodos(query) {
        if (query.trim() === '') {
            this.render();
            return;
        }

        const filteredTodos = this.todos.filter(todo => 
            todo.text.toLowerCase().includes(query.toLowerCase())
        );

        const container = document.querySelector('.todos-container');
        container.innerHTML = '';

        if (filteredTodos.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="text-6xl mb-4">🔍</div>
                    <h3 class="text-lg font-semibold mb-2">검색 결과가 없습니다</h3>
                    <p class="text-muted-foreground">"${query}"와 일치하는 할일이 없습니다.</p>
                </div>
            `;
            return;
        }

        filteredTodos.forEach(todo => {
            const todoElement = this.createTodoElement(todo);
            container.appendChild(todoElement);
        });
    }

    // 할일 편집 (추가 기능)
    editTodo(id, newText) {
        const todo = this.todos.find(todo => todo.id === id);
        if (todo && newText.trim() !== '') {
            todo.text = newText.trim();
            todo.updatedAt = new Date().toISOString();
            this.saveTodos();
            this.render();
        }
    }

    // 할일 우선순위 설정 (추가 기능)
    setPriority(id, priority) {
        const todo = this.todos.find(todo => todo.id === id);
        if (todo) {
            todo.priority = priority; // 'high', 'medium', 'low'
            this.saveTodos();
            this.render();
        }
    }

    // 할일 편집
    editTodo(id) {
        const todo = this.todos.find(todo => todo.id === id);
        if (!todo) return;

        const newText = prompt('할일을 수정하세요:', todo.text);
        if (newText !== null && newText.trim() !== '') {
            todo.text = newText.trim();
            todo.updatedAt = new Date().toISOString();
            this.saveTodos();
            this.render();
            this.updateStats();
        }
    }

    // 검색 기능
    searchTodos(query) {
        if (query.trim() === '') {
            this.render();
            return;
        }

        const filteredTodos = this.todos.filter(todo => 
            todo.text.toLowerCase().includes(query.toLowerCase())
        );

        const container = document.querySelector('.todos-container');
        container.innerHTML = '';

        if (filteredTodos.length === 0) {
            container.innerHTML = `
                <div class="empty-state text-center py-12">
                    <div class="text-6xl mb-4">🔍</div>
                    <h3 class="text-lg font-semibold mb-2 text-gray-700">검색 결과가 없습니다</h3>
                    <p class="text-gray-500">"${query}"와 일치하는 할일이 없습니다.</p>
                </div>
            `;
            return;
        }

        filteredTodos.forEach(todo => {
            const todoElement = this.createTodoElement(todo);
            container.appendChild(todoElement);
        });
    }

    // 완료된 할일 일괄 삭제
    clearCompletedTodos() {
        const completedCount = this.todos.filter(todo => todo.completed).length;
        if (completedCount === 0) {
            alert('완료된 할일이 없습니다.');
            return;
        }

        if (confirm(`완료된 ${completedCount}개의 할일을 삭제하시겠습니까?`)) {
            this.todos = this.todos.filter(todo => !todo.completed);
            this.saveTodos();
            this.render();
            this.updateStats();
        }
    }

    // 데이터 내보내기
    exportTodos() {
        const data = {
            todos: this.todos,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `todolist-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // 데이터 가져오기
    importTodos(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.todos && Array.isArray(data.todos)) {
                    if (confirm(`가져올 데이터에 ${data.todos.length}개의 할일이 있습니다. 기존 데이터를 덮어쓰시겠습니까?`)) {
                        this.todos = data.todos;
                        this.saveTodos();
                        this.render();
                        this.updateStats();
                        alert('데이터를 성공적으로 가져왔습니다.');
                    }
                } else {
                    alert('올바른 형식의 파일이 아닙니다.');
                }
            } catch (error) {
                alert('파일을 읽는 중 오류가 발생했습니다.');
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);
    }

    // 할일 정렬 (우선순위별)
    sortTodos() {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        this.todos.sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1; // 미완료 항목이 먼저
            }
            return priorityOrder[b.priority] - priorityOrder[a.priority]; // 높은 우선순위가 먼저
        });
        this.saveTodos();
        this.render();
    }

    // 할일 복제
    duplicateTodo(id) {
        const todo = this.todos.find(todo => todo.id === id);
        if (!todo) return;

        const duplicatedTodo = {
            ...todo,
            id: Date.now().toString(),
            text: `${todo.text} (복사본)`,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(duplicatedTodo);
        this.saveTodos();
        this.render();
        this.updateStats();
    }
}

// 키보드 단축키 지원
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter로 할일 추가
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const addBtn = document.getElementById('add-btn');
        if (!addBtn.disabled) {
            addBtn.click();
        }
    }

    // Escape로 입력 필드 초기화
    if (e.key === 'Escape') {
        const input = document.getElementById('todo-input');
        input.value = '';
        input.blur();
        document.getElementById('add-btn').disabled = true;
    }
});

// 드래그 앤 드롭 지원 (추가 기능)
function enableDragAndDrop() {
    const container = document.querySelector('.todos-container');
    
    container.addEventListener('dragover', (e) => {
        e.preventDefault();
        container.classList.add('drag-over');
    });

    container.addEventListener('dragleave', () => {
        container.classList.remove('drag-over');
    });

    container.addEventListener('drop', (e) => {
        e.preventDefault();
        container.classList.remove('drag-over');
        
        const todoId = e.dataTransfer.getData('text/plain');
        const todo = app.todos.find(t => t.id === todoId);
        
        if (todo) {
            // 여기서 할일의 순서를 변경하는 로직을 구현할 수 있습니다
            console.log('드롭된 할일:', todo.text);
        }
    });
}

// 앱 초기화 (비동기)
let app;
async function initializeApp() {
    app = new TodoApp();
    await app.init();
}

// 앱 초기화 실행
initializeApp();

// 개발자 도구용 전역 함수들
window.todoApp = {
    app: app,
    clearAll: () => app.clearAllTodos(),
    clearCompleted: () => app.clearCompletedTodos(),
    search: (query) => app.searchTodos(query),
    getTodos: () => app.todos,
    addTodo: (text) => {
        const input = document.getElementById('todo-input');
        input.value = text;
        app.addTodo();
    }
};

// 페이지 로드 완료 후 추가 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 입력 필드에 포커스
    document.getElementById('todo-input').focus();
    
    // 드래그 앤 드롭 활성화
    enableDragAndDrop();
    
    console.log('Todo App이 성공적으로 로드되었습니다!');
    console.log('개발자 도구에서 window.todoApp을 사용하여 앱을 제어할 수 있습니다.');
});
