export default async function ProfilePage() {
  const response = await fetch("/api/user");
  const users = await response.json();
  console.log(users);
  return (
    <div>
      <h1>Profile Page</h1>
      <p>This is the profile page.</p>
    </div>
  );
}
