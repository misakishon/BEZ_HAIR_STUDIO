import Sidebar from "../components/Sidebar";
import Dashboard from "./dashboard";

function Admin() {
    return (
        <Sidebar>
            <main className="admin-content">
                <Dashboard />
            </main>
        </Sidebar>
    );
}

export default Admin;
