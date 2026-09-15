/**
 * Cliente HTTP para la API de Fonarte For Artists (NestJS Backend).
 * Maneja autenticación JWT, rotación automática de refresh token y llamadas tipadas.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('fonarte_access_token');
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('fonarte_refresh_token');
  }

  public setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('fonarte_access_token', accessToken);
    localStorage.setItem('fonarte_refresh_token', refreshToken);
  }

  public clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('fonarte_access_token');
    localStorage.removeItem('fonarte_refresh_token');
    localStorage.removeItem('fonarte_user');
  }

  public async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
    retry = true,
  ): Promise<T> {
    const token = this.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    // Manejo de expiración de token con intento de refresh
    if (response.status === 401 && retry) {
      const refreshToken = this.getRefreshToken();
      if (refreshToken) {
        try {
          const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshRes.ok) {
            const data = await refreshRes.json();
            this.setTokens(data.accessToken, data.refreshToken);
            return this.request<T>(endpoint, options, false);
          }
        } catch {
          this.clearTokens();
        }
      }
      this.clearTokens();
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
    }

    return data as T;
  }

  // ===========================================================================
  // AUTH
  // ===========================================================================
  async login(email: string, password: string) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setTokens(data.accessToken, data.refreshToken);
    const user = await this.getMe();
    localStorage.setItem('fonarte_user', JSON.stringify(user));
    return { tokens: data, user };
  }

  async logout() {
    const refreshToken = this.getRefreshToken();
    try {
      await this.request('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    } finally {
      this.clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async createInvitation(email: string, artistaId?: number, esAdmin?: boolean) {
    return this.request('/auth/invitations', {
      method: 'POST',
      body: JSON.stringify({ email, artistaId, esAdmin }),
    });
  }

  async acceptInvitation(token: string, password: string) {
    const data = await this.request('/auth/invitations/accept', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
    this.setTokens(data.accessToken, data.refreshToken);
    return data;
  }

  // ===========================================================================
  // ADMIN
  // ===========================================================================
  async getSellos() {
    return this.request('/admin/sellos');
  }

  async createSello(nombre: string) {
    return this.request('/admin/sellos', {
      method: 'POST',
      body: JSON.stringify({ nombre }),
    });
  }

  async deleteSello(id: number) {
    return this.request(`/admin/sellos/${id}`, { method: 'DELETE' });
  }

  async getArtistas() {
    return this.request('/admin/artistas');
  }

  async createArtista(nombre: string, selloId: number) {
    return this.request('/admin/artistas', {
      method: 'POST',
      body: JSON.stringify({ nombre, selloId }),
    });
  }

  async getCatalogo(artistaId?: number) {
    const query = artistaId ? `?artistaId=${artistaId}` : '';
    return this.request(`/admin/catalogo${query}`);
  }

  async createCatalogoItem(item: {
    artistaId: number;
    tipo: 'CANCION' | 'ALBUM' | 'VIDEO';
    referenciaIdFonarte2: string;
    nombre?: string;
  }) {
    return this.request('/admin/catalogo', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async getUsuarios() {
    return this.request('/admin/usuarios');
  }

  async updateUsuarioStatus(id: number, activo: boolean) {
    return this.request(`/admin/usuarios/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ activo }),
    });
  }

  async getConcesiones(usuarioId?: number) {
    const query = usuarioId ? `?usuarioId=${usuarioId}` : '';
    return this.request(`/admin/concesiones${query}`);
  }

  async otorgarConcesion(concesion: {
    usuarioId: number;
    tipoEntidad: 'SELLO' | 'ARTISTA' | 'ALBUM' | 'CANCION' | 'VIDEO';
    entidadId: number;
    efecto: 'ALLOW' | 'DENY';
  }) {
    return this.request('/admin/concesiones', {
      method: 'POST',
      body: JSON.stringify(concesion),
    });
  }

  async revocarConcesion(id: number) {
    return this.request(`/admin/concesiones/${id}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // AUDIT
  // ===========================================================================
  async getAuditLogs(params: {
    page?: number;
    limit?: number;
    usuarioId?: number;
    evento?: string;
    desde?: string;
    hasta?: string;
  } = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.usuarioId) query.set('usuarioId', params.usuarioId.toString());
    if (params.evento) query.set('evento', params.evento);
    if (params.desde) query.set('desde', params.desde);
    if (params.hasta) query.set('hasta', params.hasta);
    return this.request(`/audit/logs?${query.toString()}`);
  }

  async getAuditStats() {
    return this.request('/audit/stats');
  }

  // ===========================================================================
  // STATS (Solo métricas y conteos, sin datos monetarios)
  // ===========================================================================
  async getKpi(artistaId: number) {
    return this.request(`/stats/kpi/${artistaId}`);
  }

  async getStreamsPorCancion(artistaId: number, params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/stats/canciones/${artistaId}${query ? `?${query}` : ''}`);
  }

  async getStreamsPorPlataforma(artistaId: number, params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/stats/plataformas/${artistaId}${query ? `?${query}` : ''}`);
  }

  async getStreamsPorPais(artistaId: number, params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/stats/paises/${artistaId}${query ? `?${query}` : ''}`);
  }

  async getTendenciaMensual(artistaId: number, params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/stats/tendencia/${artistaId}${query ? `?${query}` : ''}`);
  }
}

export const api = new ApiClient();
