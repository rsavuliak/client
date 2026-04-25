import todoApi from './todoApi';

export type List = { id: string; userId: string; name: string; createdAt: string };
export type Todo = { id: string; listId: string; userId: string; text: string; done: boolean; createdAt: string };

export const todoService = {
  getLists: () => todoApi.get<List[]>('/lists'),
  createList: (name: string) => todoApi.post<List>('/lists', { name }),
  updateList: (id: string, name: string) => todoApi.patch<List>(`/lists/${id}`, { name }),
  deleteList: (id: string) => todoApi.delete(`/lists/${id}`),

  getTodos: (listId: string) => todoApi.get<Todo[]>(`/lists/${listId}/todos`),
  createTodo: (listId: string, text: string) => todoApi.post<Todo>(`/lists/${listId}/todos`, { text }),
  updateTodo: (listId: string, id: string, patch: { text?: string; done?: boolean }) =>
    todoApi.patch<Todo>(`/lists/${listId}/todos/${id}`, patch),
  deleteTodo: (listId: string, id: string) => todoApi.delete(`/lists/${listId}/todos/${id}`),
  clearAllTodos: (listId: string) => todoApi.delete(`/lists/${listId}/todos`),
};
