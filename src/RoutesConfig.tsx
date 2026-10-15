import { Routes, Route } from "react-router";
import TodoPage from "./pages/todo/TodoPage";

function RoutesConfig() {
    return <Routes>
        <Route path="/todo-list" element={<TodoPage />} />
    </Routes>
}

export default RoutesConfig