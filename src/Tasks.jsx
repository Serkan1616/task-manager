import { useDroppable } from "@dnd-kit/core";
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function Tasks({ name, tasks, onAddTask }) {
  const { setNodeRef } = useDroppable({
    id: name.toLowerCase().replace(/\s/g, "-"),
  });

  const getMarkerColor = (name) => {
    switch (name.toLowerCase()) {
      case "backlog":
        return "marker:text-pink-400";
      case "in progress":
        return "marker:text-yellow-400";
      case "in review":
        return "marker:text-blue-400";
      case "completed":
        return "marker:text-green-400";
      default:
        return "marker:text-gray-400";
    }
  };

  return (
    <div
      ref={setNodeRef}
      className="flex-1/4 flex flex-col gap-2 p-4 rounded-2xl bg-[#2a2d32] w-64 min-h-[400px]"
    >
      <li className={`list-disc text-xl mb-4 ${getMarkerColor(name)}`}>
        {name} ({tasks.length})
      </li>

      <SortableContext
        items={tasks.map((task) => task.id.toString())}
        strategy={verticalListSortingStrategy}
      >
        {tasks.length > 0 ? (
          tasks.map((task) => <TaskCard key={task.id} task={task} />)
        ) : (
          <div className="p-4 rounded-lg border-2 border-dashed border-gray-600 min-h-[100px] flex items-center justify-center text-gray-400 text-sm">
            Drop Here
          </div>
        )}
      </SortableContext>

      {name.toLowerCase() === "backlog" && (
        <button
          onClick={onAddTask}
          className="flex items-center justify-between gap-2 mt-4 p-2 text-[#5e80df] font-bold cursor-pointer bg-[#c3dafa] rounded-2xl"
        >
          <p className="font-semibold">Add new task card</p>
          <span className="text-2xl">+</span>
        </button>
      )}
    </div>
  );
}

function TaskCard({ task }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: task.id.toString(),
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getBackgroundColor = (tags) => {
    if (!tags || tags.length === 0) return "#555";
    const tag = tags[0].toLowerCase();
    switch (tag) {
      case "technical":
        return "#a0b7f2";
      case "design":
        return "#e0c783";
      case "concept":
        return "#d48682";
      case "front-end":
        return "#b0dcb6";
      default:
        return "#555";
    }
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className=" p-3 flex flex-col gap-2 bg-[#1a1b1f] rounded-2xl"
    >
      {task.background && (
        <img className="w-full rounded-xl" src={task.background} alt="" />
      )}
      <p>{task.title}</p>
      <div className="flex gap-2">
        {task.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs px-2 py-1 mt-2 rounded-md"
            style={{
              backgroundColor: getBackgroundColor([tag]),
              color: "#000",
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default Tasks;
