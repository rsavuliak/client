import { useState, useEffect } from "react";
import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { todoService, type List, type Todo } from "@/services/todoService";

export default function TodoPage() {
  const [lists, setLists] = useState<List[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [listsLoading, setListsLoading] = useState(true);
  const [todosLoading, setTodosLoading] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newTodoText, setNewTodoText] = useState("");
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingListName, setEditingListName] = useState("");

  useEffect(() => {
    todoService.getLists()
      .then((res) => {
        setLists(res.data);
        if (res.data.length > 0) setSelectedListId(res.data[0].id);
      })
      .finally(() => setListsLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedListId) { setTodos([]); return; }
    setTodosLoading(true);
    todoService.getTodos(selectedListId)
      .then((res) => setTodos(res.data))
      .finally(() => setTodosLoading(false));
  }, [selectedListId]);

  const addList = async () => {
    const name = newListName.trim();
    if (!name) return;
    const res = await todoService.createList(name);
    setLists((prev) => [...prev, res.data]);
    setSelectedListId(res.data.id);
    setNewListName("");
  };

  const deleteList = async (id: string) => {
    await todoService.deleteList(id);
    const remaining = lists.filter((l) => l.id !== id);
    setLists(remaining);
    if (selectedListId === id) setSelectedListId(remaining.length > 0 ? remaining[0].id : null);
  };

  const startRenameList = (list: List) => {
    setEditingListId(list.id);
    setEditingListName(list.name);
  };

  const confirmRenameList = async (id: string) => {
    const name = editingListName.trim();
    if (name) {
      const res = await todoService.updateList(id, name);
      setLists((prev) => prev.map((l) => (l.id === id ? res.data : l)));
    }
    setEditingListId(null);
  };

  const addTodo = async () => {
    const text = newTodoText.trim();
    if (!text || !selectedListId) return;
    const res = await todoService.createTodo(selectedListId, text);
    setTodos((prev) => [...prev, res.data]);
    setNewTodoText("");
  };

  const toggleTodo = async (todo: Todo) => {
    if (!selectedListId) return;
    const res = await todoService.updateTodo(selectedListId, todo.id, { done: !todo.done });
    setTodos((prev) => prev.map((t) => (t.id === todo.id ? res.data : t)));
  };

  const deleteTodo = async (id: string) => {
    if (!selectedListId) return;
    await todoService.deleteTodo(selectedListId, id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const clearCompleted = async () => {
    if (!selectedListId) return;
    const completed = todos.filter((t) => t.done);
    await Promise.all(completed.map((t) => todoService.deleteTodo(selectedListId, t.id)));
    setTodos((prev) => prev.filter((t) => !t.done));
  };

  const active = todos.filter((t) => !t.done);
  const done = todos.filter((t) => t.done);
  const selectedList = lists.find((l) => l.id === selectedListId);

  return (
    <div className="flex min-h-full divide-x divide-border">
      {/* Lists panel */}
      <div className="w-52 shrink-0 flex flex-col gap-3 p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-1">
          Lists
        </h2>

        {listsLoading ? (
          <p className="text-sm text-muted-foreground px-1">Loading…</p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {lists.map((list) => (
              <li key={list.id}>
                {editingListId === list.id ? (
                  <form
                    onSubmit={(e) => { e.preventDefault(); confirmRenameList(list.id); }}
                  >
                    <Input
                      value={editingListName}
                      onChange={(e) => setEditingListName(e.target.value)}
                      className="h-7 text-sm"
                      autoFocus
                      onBlur={() => confirmRenameList(list.id)}
                    />
                  </form>
                ) : (
                  <div
                    className={cn(
                      "group flex items-center justify-between rounded-md px-2 py-1.5 cursor-pointer hover:bg-accent transition-colors",
                      selectedListId === list.id && "bg-accent"
                    )}
                    onClick={() => setSelectedListId(list.id)}
                  >
                    <span
                      className="flex-1 text-sm truncate"
                      onDoubleClick={(e) => { e.stopPropagation(); startRenameList(list); }}
                    >
                      {list.name}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteList(list.id); }}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive shrink-0 ml-1 transition-all"
                      aria-label="Delete list"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        <form
          className="flex gap-1.5 pt-1"
          onSubmit={(e) => { e.preventDefault(); addList(); }}
        >
          <Input
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="New list…"
            className="h-7 text-sm flex-1 min-w-0"
          />
          <Button type="submit" size="sm" className="h-7 w-7 p-0 shrink-0" disabled={!newListName.trim()}>
            <Plus className="size-3.5" />
          </Button>
        </form>
      </div>

      {/* Todos panel */}
      <div className="flex-1 flex flex-col gap-6 p-6 max-w-xl">
        {!selectedList ? (
          <div className="flex items-center justify-center h-48">
            <p className="text-sm text-muted-foreground">
              {listsLoading ? "Loading…" : "Create a list to get started."}
            </p>
          </div>
        ) : (
          <>
            <div>
              <h1 className="text-xl font-semibold">{selectedList.name}</h1>
              <p className="text-sm text-muted-foreground">
                {todos.length === 0
                  ? "Nothing here yet."
                  : active.length === 0
                  ? "All done!"
                  : `${active.length} task${active.length === 1 ? "" : "s"} remaining`}
              </p>
            </div>

            <form
              className="flex gap-2"
              onSubmit={(e) => { e.preventDefault(); addTodo(); }}
            >
              <Input
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                placeholder="Add a task…"
                className="flex-1"
                autoFocus
              />
              <Button type="submit" disabled={!newTodoText.trim()}>
                Add
              </Button>
            </form>

            {todosLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : (
              <>
                {todos.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-12">
                    No tasks yet. Add one above to get started.
                  </p>
                )}

                {active.length > 0 && (
                  <ul className="flex flex-col divide-y divide-border/50">
                    {active.map((todo) => (
                      <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} onDelete={deleteTodo} />
                    ))}
                  </ul>
                )}

                {done.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Completed ({done.length})
                      </span>
                      <button
                        onClick={clearCompleted}
                        className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-colors"
                      >
                        Clear all
                      </button>
                    </div>
                    <ul className="flex flex-col divide-y divide-border/50">
                      {done.map((todo) => (
                        <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} onDelete={deleteTodo} />
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TodoItem({
  todo,
  onToggle,
  onDelete,
}: {
  todo: Todo;
  onToggle: (todo: Todo) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <li className="group flex items-center gap-3 py-2.5 px-1">
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => onToggle(todo)}
        className="size-4 shrink-0 cursor-pointer accent-primary rounded"
      />
      <span
        className={cn(
          "flex-1 text-sm select-none cursor-pointer",
          todo.done && "line-through text-muted-foreground"
        )}
        onClick={() => onToggle(todo)}
      >
        {todo.text}
      </span>
      <button
        onClick={() => onDelete(todo.id)}
        aria-label="Delete task"
        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all shrink-0"
      >
        <Trash2 className="size-3.5" />
      </button>
    </li>
  );
}
