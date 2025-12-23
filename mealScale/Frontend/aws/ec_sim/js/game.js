const components = [
  { id: 'ec2', name: 'EC2', type: 'compute', points: 10, desc: 'Máquina virtual escalable' },
  { id: 'lambda', name: 'Lambda', type: 'compute', points: 15, desc: 'Ejecución sin servidor' },
  { id: 's3', name: 'S3', type: 'storage', points: 10, desc: 'Almacenamiento de objetos' },
  { id: 'rds', name: 'RDS', type: 'database', points: 10, desc: 'Base de datos relacional' },
];

let score = 0;

window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('blocks');
  components.forEach(c => {
    container.innerHTML += `
      <div class="col-md-3">
        <div class="card h-100 shadow-sm">
          <div class="card-body text-center">
            <h5>${c.name}</h5>
            <p>${c.desc}</p>
            <button class="btn btn-primary select-btn" data-id="${c.id}">Elegir</button>
          </div>
        </div>
      </div>`;
  });

  document.querySelectorAll('.select-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const comp = components.find(c => c.id === e.target.dataset.id);
      score += comp.points;
      document.getElementById('score').textContent = score;
      btn.disabled = true;
      btn.textContent = 'Seleccionado ✔';
    });
  });

  document.getElementById('finish').addEventListener('click', () => {
    alert(`¡Felicidades! Has obtenido ${score} puntos.`);
  });
});
