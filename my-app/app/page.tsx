import { prisma } from "@/lib/db";
import { addTodo, deleteTodo, toggleTodo } from "./actions";

export default async function Home() {
  const todos = await prisma.todo.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="p-10 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Feladatok</h1>

      {/* CREATE FORM */}
      <form action={addTodo} className="flex gap-2 mb-8">
        <input
          name="title"
          type="text"
          className="border p-2 rounded w-full color-black"
          placeholder="Új feladat..."
          required
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Hozzáadás
        </button>
      </form>

      {/* READ & DELETE & UPDATE LIST */}
      <ul className="space-y-3">
        {todos.map((todo) => (
          <li key={todo.id} className="flex items-center justify-between border-b pb-2">
            <span className={todo.completed ? "line-through text-gray-400" : ""}>
              {todo.title}
            </span>
            <div className="flex gap-2">
              <button
                onClick={async () => { "use server"; await toggleTodo(todo.id, todo.completed); }}
                className="text-sm bg-gray-200 px-2 py-1 rounded"
              >
                {todo.completed ? "Mégse" : "Kész"}
              </button>
              <form action={async () => { "use server"; await deleteTodo(todo.id); }}>
                <button className="text-sm bg-red-500 text-white px-2 py-1 rounded">
                  Törlés
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}