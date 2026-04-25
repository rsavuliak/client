import { useState, useEffect } from "react";
import { Trash2, Plus, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { todoService, type List, type Todo } from "@/services/todoService";

export default function TodoPage() {
  const [lists, setLists] = useState<List[]>([]);
  const [listsLoading, setListsLoading] = useState(true);
  const [newListName, setNewListName] = useState("");
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingListName, setEditingListName] = useState("");

  const [selectedList, setSelectedList] = useState<List | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todosLoading, setTodosLoading] = useState(false);
  const [newTodoText, setNewTodoText] = useState("");

  useEffect(() => {
    todoService.getLists()
      .then((res) => setLists(res.data))
      .finally(() => setListsLoading(false));
  }, []);

  const openList = (list: List) => {
    setSelectedList(list);
    setTodosLoading(true);
    todoService.getTodos(list.id)
      .then((res) => setTodos(res.data))
      .finally(() => setTodosLoading(false));
  };

  const goBack = () => {
    setSelectedList(null);
    setTodos([]);
    setNewTodoText("");
  };

  const addList = async () => {
    const name = newListName.trim();
    if (!name) return;
    const res = await todoService.createList(name);
    setLists((prev) => [...prev, res.data]);
    setNewListName("");
    openList(res.data);
  };

  const deleteList = async (id: string) => {
    await todoService.deleteList(id);
    setLists((prev) => prev.filter((l) => l.id !== id));
    if (selectedList?.id === id) goBack();
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
      if (selectedList?.id === id) setSelectedList(res.data);
    }
    setEditingListId(null);
  };

  const addTodo = async () => {
    const text = newTodoText.trim();
    if (!text || !selectedList) return;
    const res = await todoService.createTodo(selectedList.id, text);
    setTodos((prev) => [...prev, res.data]);
    setNewTodoText("");
  };

  const toggleTodo = async (todo: Todo) => {
    if (!selectedList) return;
    const res = await todoService.updateTodo(selectedList.id, todo.id, { done: !todo.done });
    setTodos((prev) => prev.map((t) => (t.id === todo.id ? res.data : t)));
  };

  const deleteTodo = async (id: string) => {
    if (!selectedList) return;
    await todoService.deleteTodo(selectedList.id, id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const clearCompleted = async () => {
    if (!selectedList) return;
    const completed = todos.filter((t) => t.done);
    await Promise.all(completed.map((t) => todoService.deleteTodo(selectedList.id, t.id)));
    setTodos((prev) => prev.filter((t) => !t.done));
  };

  if (selectedList) {
    const active = todos.filter((t) => !t.done);
    const done = todos.filter((t) => t.done);

    return (
      <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Back to lists"
          >
            <ArrowLeft className="size-5" />
          </button>
          {editingListId === selectedList.id ? (
            <form
              className="flex-1"
              onSubmit={(e) => { e.preventDefault(); confirmRenameList(selectedList.id); }}
            >
              <Input
                value={editingListName}
                onChange={(e) => setEditingListName(e.target.value)}
                className="text-xl font-semibold h-auto py-0 border-0 border-b rounded-none px-0 focus-visible:ring-0"
                autoFocus
                onBlur={() => confirmRenameList(selectedList.id)}
              />
            </form>
          ) : (
            <h1
              className="text-xl font-semibold flex-1 cursor-pointer"
              onDoubleClick={() => startRenameList(selectedList)}
            >
              {selectedList.name}
            </h1>
          )}
        </div>

        <p className="text-sm text-muted-foreground -mt-2">
          {todos.length === 0
            ? "Nothing here yet."
            : active.length === 0
            ? "All done!"
            : `${active.length} task${active.length === 1 ? "" : "s"} remaining`}
        </p>

        {/* Add task */}
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
          <Button type="submit" disabled={!newTodoText.trim()}>Add</Button>
        </form>

        {todosLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <>
            {todos.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-10">
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
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-5">
      <h1 className="text-xl font-semibold">My Lists</h1>

      {/* New list form */}
      <form
        className="flex gap-2"
        onSubmit={(e) => { e.preventDefault(); addList(); }}
      >
        <Input
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          placeholder="New list name…"
          className="flex-1"
          autoFocus
        />
        <Button type="submit" disabled={!newListName.trim()}>
          <Plus className="size-4 mr-1" />
          Create
        </Button>
      </form>

      {listsLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : lists.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-10">
          No lists yet. Create one above to get started.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-border/50">
          {lists.map((list) => (
            <li key={list.id} className="group flex items-center gap-2 py-1">
              {editingListId === list.id ? (
                <form
                  className="flex-1"
                  onSubmit={(e) => { e.preventDefault(); confirmRenameList(list.id); }}
                >
                  <Input
                    value={editingListName}
                    onChange={(e) => setEditingListName(e.target.value)}
                    className="h-9"
                    autoFocus
                    onBlur={() => confirmRenameList(list.id)}
                  />
                </form>
              ) : (
                <>
                  <button
                    className="flex-1 flex items-center justify-between py-3 text-left"
                    onClick={() => openList(list)}
                  >
                    <span
                      className="text-sm font-medium"
                      onDoubleClick={(e) => { e.stopPropagation(); startRenameList(list); }}
                    >
                      {list.name}
                    </span>
                    <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                  </button>
                  <button
                    onClick={() => deleteList(list.id)}
                    aria-label="Delete list"
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all shrink-0 p-1"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
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
    <li className="flex items-center gap-3 py-3 px-1">
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => onToggle(todo)}
        className="size-5 shrink-0 cursor-pointer accent-primary rounded"
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
        className="text-muted-foreground hover:text-destructive transition-colors shrink-0 p-1"
      >
        <Trash2 className="size-4" />
      </button>
    </li>
  );
}
