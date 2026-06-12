describe('API — JSONPlaceholder', () => {
  const BASE = 'https://jsonplaceholder.typicode.com';

  it('GET /posts/1 retorna status 200 y estructura correcta', () => {
    cy.request('GET', `${BASE}/posts/1`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.all.keys('userId', 'id', 'title', 'body');
      expect(response.body.id).to.eq(1);
    });
  });

  it('POST /posts retorna status 201 y eco de datos enviados', () => {
    const payload = { title: 'Test Post', body: 'Contenido de prueba', userId: 1 };

    cy.request('POST', `${BASE}/posts`, payload).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body.title).to.eq(payload.title);
      expect(response.body.body).to.eq(payload.body);
      expect(response.body.userId).to.eq(payload.userId);
      expect(response.body).to.have.property('id');
    });
  });
});
