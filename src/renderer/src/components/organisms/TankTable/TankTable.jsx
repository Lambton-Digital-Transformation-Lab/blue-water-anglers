import { Button } from '../../atoms'

export const TankTable = ({ tanks, onEdit, onDelete }) => {
  return (
    <div>
      <table className="tank_table">
        <thead>
          <tr>
            <th>Tank Name</th>
            <th>Fish Type</th>
            <th>Flow</th>
            <th>Clean</th>
            <th>DO</th>
            <th>Number of Fishes</th>
            <th>Food Size</th>
            <th>Fish Size</th>
            <th>Diet</th>
            <th>Diet Type</th>
            <th>Mort</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tanks.map((tank, index) => (
            <tr key={index}>
              <td>{tank.tank_name}</td>
              <td>{tank.fish_type_name}</td>
              <td>{tank.flow ? 'Yes' : 'No'}</td>
              <td>{tank.clean ? 'Yes' : 'No'}</td>
              <td>{tank.do_level}</td>
              <td>{tank.number_of_fishes}</td>
              <td>{tank.food_size}</td>
              <td>{tank.fish_size}</td>
              <td>{tank.diet}</td>
              <td>{tank.diet_type}</td>
              <td>{tank.mort}</td>
              <td>
                <Button onClick={() => onEdit(index)}>Edit</Button>
                <Button onClick={() => onDelete(index)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
