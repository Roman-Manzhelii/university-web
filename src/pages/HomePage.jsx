export default function HomePage() {
    return (
        <div>
            <h1>University API Demo</h1>
            <p>
                This React app uses the University API hosted at
                <code> https://university-api.runasp.net</code>.
            </p>
            <ul>
                <li>Public: view departments and courses.</li>
                <li>Login as student or admin via the API.</li>
                <li>Student: view and manage own enrollments.</li>
                <li>
                    Admin: manage students, their enrollments and all courses.
                </li>
            </ul>
            <p>Use the navigation bar to open each section.</p>
        </div>
    );
}
