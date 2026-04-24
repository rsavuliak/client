import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { useAuthStore } from "@/services/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Todo = {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
};

function storageKey(userId: string) {
  return `todos_${userId}`;
}

function loadTodos(userId: string): Todo[] {
  try {
    return JSON.parse(localStorage.getItem(storageKey(userId)) ?? "[]");
  } catch {
    return [];
  }
}

export default function TodoPage() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? "guest";

  const [todos, setTodos] = useState<Todo[]>(() => loadTodos(userId));
  const [input, setInput] = useState("");

  useEffect(() => {
    localStorage.setItem(storageKey(userId), JSON.stringify(todos));
  }, [todos, userId]);

  const addTodo = () => {
    const text = input.trim();
    if (!text) return;
    setTodos((prev) => [
      { id: crypto.randomUUID(), text, done: false, createdAt: new Date().toISOString() },
      ...prev,
    ]);
    setInput("");
  };

  const toggleTodo = (id: string) =>
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const deleteTodo = (id: string) =>
    setTodos((prev) => prev.filter((t) => t.id !== id));

  const clearDone = () =>
    setTodos((prev) => prev.filter((t) => !t.done));

  const active = todos.filter((t) => !t.done);
  const done = todos.filter((t) => t.done);

  return (
    <div className="max-w-xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Todo</h1>
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
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a task…"
          className="flex-1"
          autoFocus
        />
        <Button type="submit" disabled={!input.trim()}>
          Add
        </Button>
      </form>

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
              onClick={clearDone}
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
    </div>
  );
}

function TodoItem({
  todo,
  onToggle,
  onDelete,
}: {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <li className="group flex items-center gap-3 py-2.5 px-1">
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => onToggle(todo.id)}
        className="size-4 shrink-0 cursor-pointer accent-primary rounded"
      />
      <span
        className={cn(
          "flex-1 text-sm select-none cursor-pointer",
          todo.done && "line-through text-muted-foreground"
        )}
        onClick={() => onToggle(todo.id)}
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
