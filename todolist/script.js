// Todo App JavaScript - PRD 기능 구현
class TodoApp {
    constructor() {
        this.todos = this.loadTodos();
        this.currentFilter = 'all';
        this.init();
    }

    // 초기화
    init() {
        this.bindEvents();
        this.render();
        this.updateStats();
    }

    // 이벤트 바인딩
    bindEvents() {
        const todoInput = document.getElementById('todo-input');
        const addBtn = document.getElementById('add-btn');
        const filterBtns = document.querySelectorAll('.filter-btn');

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
    }

    // 할일 추가
    addTodo() {
        const input = document.getElementById('todo-input');
        const text = input.value.trim();

        if (text === '') return;

        const todo = {
            id: Date.now().toString(),
            text: text,
            completed: false,
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
    }

    // 할일 삭제
    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveTodos();
        this.render();
        this.updateStats();
    }

    // 할일 완료 상태 토글
    toggleTodo(id) {
        const todo = this.todos.find(todo => todo.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
            this.updateStats();
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
        switch (this.currentFilter) {
            case 'active':
                message = '미완료된 할일이 없습니다.';
                break;
            case 'completed':
                message = '완료된 할일이 없습니다.';
                break;
            default:
                message = '아직 할일이 없습니다.<br>새로운 할일을 추가해보세요!';
        }

        container.innerHTML = `
            <div class="empty-state">
                <div class="text-6xl mb-4">📝</div>
                <h3 class="text-lg font-semibold mb-2">${this.currentFilter === 'all' ? '할일이 없습니다' : '해당하는 할일이 없습니다'}</h3>
                <p class="text-muted-foreground">${message}</p>
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
        const deleteBtn = clone.querySelector('.btn');

        // 할일 텍스트 설정
        todoText.textContent = todo.text;

        // 완료 상태 설정
        checkbox.checked = todo.completed;
        if (todo.completed) {
            todoItem.classList.add('completed');
        }

        // 이벤트 리스너 추가
        checkbox.addEventListener('change', () => {
            this.toggleTodo(todo.id);
        });

        deleteBtn.addEventListener('click', () => {
            this.deleteTodo(todo.id);
        });

        // 애니메이션 추가
        todoItem.style.opacity = '0';
        todoItem.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            todoItem.style.transition = 'all 0.2s ease-out';
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

        document.getElementById('total-todos').textContent = totalTodos;
        document.getElementById('completed-todos').textContent = completedTodos;
        document.getElementById('completion-rate').textContent = `${completionRate}%`;
    }

    // 로컬 스토리지에서 할일 로드
    loadTodos() {
        try {
            const stored = localStorage.getItem('todolist-todos');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('할일 로드 중 오류 발생:', error);
            return [];
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

// 앱 초기화
const app = new TodoApp();

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
