import { DndContext, closestCenter } from "@dnd-kit/core";
import Tasks from "./Tasks";
import { useState, useEffect } from "react";
import "./App.css";
import plus from "./assets/plus.svg";
import { DragOverlay } from "@dnd-kit/core";

function App() {
  const status = ["Backlog", "In Progress", "In Review", "Completed"];
  const boards = ["Design Board", "Learning Board", "Hobby Board"];
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    title: "",
    background: "",
    tag: "technical",
  });
  const [activeTask, setActiveTask] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://raw.githubusercontent.com/devchallenges-io/curriculum/refs/heads/main/4-frontend-libaries/challenges/group_1/data/task-manager/board-1.json"
        );
        const data = await response.json();
        setTasks(data.tasks); // dikkat: sadece data.tasks
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const updatedTasks = [...tasks];

    const activeTaskIndex = updatedTasks.findIndex(
      (task) => task.id.toString() === activeId.toString()
    );

    const activeTask = updatedTasks[activeTaskIndex];

    if (!activeTask) return;

    const allColumnIds = ["backlog", "in-progress", "in-review", "completed"];

    if (allColumnIds.includes(overId.toLowerCase())) {
      updatedTasks[activeTaskIndex] = {
        ...activeTask,
        status: overId.toLowerCase(),
      };
    } else {
      const overTaskIndex = updatedTasks.findIndex(
        (task) => task.id.toString() === overId.toString()
      );

      if (overTaskIndex !== -1) {
        const sourceStatus = activeTask.status;
        const targetStatus = updatedTasks[overTaskIndex].status;

        if (sourceStatus !== targetStatus) {
          updatedTasks[activeTaskIndex] = {
            ...activeTask,
            status: targetStatus,
          };
        }
      }
      setActiveTask(null);
    }

    setTasks(updatedTasks);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const draggedTask = tasks.find(
      (task) => task.id.toString() === active.id.toString()
    );
    setActiveTask(draggedTask);
  };

  const handleCreateTask = () => {
    const newTask = {
      id: Date.now(),
      title: newTaskData.title || "New Task",
      status: "backlog", // sadece backlog'a ekliyoruz
      background: newTaskData.background || null,
      tags: [newTaskData.tag],
    };

    setTasks((prevTasks) => [...prevTasks, newTask]);
    setIsModalOpen(false); // modalı kapat
    setNewTaskData({ title: "", background: "", tag: "technical" }); // inputları temizle
  };

  return (
    <div className="flex min-h-screen p-2 bg-[#1a1b1f] text-[#ffffffcb] font-sora">
      {/* Sidebar */}
      <div className="flex flex-col gap-2 basis-1/5 p-5 bg-[#1a1b1f] rounded-2xl mr-4">
        <h1 className="text-2xl font-bold mb-6">Dashboards</h1>

        <div className="flex flex-col gap-4 flex-grow">
          {boards.map((board, index) => {
            const emojis = ["🎨", "📚", "🎮", "🚀", "🎵"];
            const emoji = emojis[index % emojis.length];

            const getEmojiBgColor = (emoji) => {
              switch (emoji) {
                case "🎨":
                  return "bg-pink-400";
                case "📚":
                  return "bg-green-400";
                case "🎮":
                  return "bg-purple-400";
                case "🚀":
                  return "bg-blue-400";
                case "🎵":
                  return "bg-yellow-400";
                default:
                  return "bg-gray-400";
              }
            };

            return (
              <div
                key={index}
                className="flex items-center gap-4 p-3 cursor-pointer"
              >
                <span
                  className={`p-2 rounded-full text-lg ${getEmojiBgColor(
                    emoji
                  )}`}
                >
                  {emoji}
                </span>
                <p className="text-md font-medium">{board}</p>
              </div>
            );
          })}
        </div>

        <button className="flex gap-2 mt-auto p-2 text-[#fff] cursor-pointer bg-[#1a1b1f] rounded-2xl">
          <span className="bg-white rounded-full">
            <img className="w-6 h-6" src={plus} alt="" />
          </span>
          <p className="font-semibold">Add new Board</p>
        </button>
      </div>

      {/* Main Board */}
      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCenter}
      >
        <div className="basis-4/5 p-5 flex   gap-4 bg-[#2a2d32] rounded-2xl">
          {status.map((statusName) => {
            const filteredTasks = tasks.filter(
              (task) =>
                task.status === statusName.toLowerCase().replace(/\s/g, "-")
            );
            return (
              <Tasks
                key={statusName}
                name={statusName}
                tasks={filteredTasks || []}
                onAddTask={openModal} // ⭐ props olarak ver
              />
            );
          })}
        </div>
        <DragOverlay>
          {activeTask ? (
            <div className="p-3 flex flex-col gap-2 bg-[#1a1b1f] rounded-2xl w-64">
              {activeTask.background && (
                <img
                  className="w-full rounded-xl"
                  src={activeTask.background}
                  alt=""
                />
              )}
              <p>{activeTask.title}</p>
              <div className="flex gap-2">
                {activeTask.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 mt-2 rounded-md"
                    style={{
                      backgroundColor: "#a0b7f2",
                      color: "#000",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {isModalOpen && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center backdrop-blur-sm z-50">
          <div className="bg-[#2a2d32] p-6 rounded-2xl w-[300px] flex flex-col gap-4 text-[#ffffffcb] border border-gray-600">
            <h2 className="text-2xl font-bold mb-2 text-center">
              Add New Task
            </h2>

            <input
              type="text"
              placeholder="Task Title"
              value={newTaskData.title}
              onChange={(e) =>
                setNewTaskData({ ...newTaskData, title: e.target.value })
              }
              className="p-2 border rounded-md"
            />

            <input
              type="text"
              placeholder="Background Image URL (optional)"
              value={newTaskData.background}
              onChange={(e) =>
                setNewTaskData({ ...newTaskData, background: e.target.value })
              }
              className="p-2 border rounded-md"
            />

            <select
              value={newTaskData.tag}
              onChange={(e) =>
                setNewTaskData({ ...newTaskData, tag: e.target.value })
              }
              className="p-2 border rounded-md "
            >
              <option className="text-black" value="technical">
                Technical
              </option>
              <option className="text-black" value="design">
                Design
              </option>
              <option className="text-black" value="concept">
                Concept
              </option>
              <option className="text-black" value="front-end">
                Front-end
              </option>
            </select>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 p-2 bg-gray-400 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                className="flex-1 p-2 bg-blue-600 text-white rounded-lg"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
