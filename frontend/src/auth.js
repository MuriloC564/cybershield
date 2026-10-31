const API_URL =
     import.meta.env.VITE_API_URL ?? 
     'http://localhost:8000'

export async function registrar({
  nome,
  sobrenome,
  email,
  username,
  senha,
  confirmarSenha
}) {
  const res = await fetch(`${API_URL}/registrar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      nome,
      sobrenome,
      email,
      username,
      senha,
      confirmar_senha: confirmarSenha
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.detail || 'Erro ao registrar')
  }

  return data
}


export async function login(usernameOuEmail, senha) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: usernameOuEmail,
      senha
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.detail || 'Erro ao entrar')
  }

  return data
}


export async function buscarUsuarioAtual(token) {
  const res = await fetch(`${API_URL}/usuario/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(
      data.detail || 'Não foi possível carregar o usuário'
    )
  }

  return data
}


export async function buscarCategorias() {
  const res = await fetch(`${API_URL}/categorias`)

  const data = await res.json()

  if (!res.ok) {
    throw new Error(
      data.detail || 'Não foi possível carregar as categorias'
    )
  }

  return data
}


export async function buscarPontuacaoCategoria(
  token,
  categoriaSlug
) {
  const res = await fetch(
    `${API_URL}/usuario/me/pontuacao/${encodeURIComponent(
      categoriaSlug
    )}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      },
    }
  )

  const data = await res.json()

  if (!res.ok) {
    throw new Error(
      data.detail || 'Não foi possível carregar a pontuação'
    )
  }

  return data
}


export async function buscarProgressoUsuario(token) {
  const res = await fetch(
    `${API_URL}/usuario/me/progresso`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      },
    }
  )

  const data = await res.json()

  if (!res.ok) {
    throw new Error(
      data.detail || 'Não foi possível carregar o progresso'
    )
  }

  return data
}


export async function obterPergunta(
  token,
  categoriaSlug,
  dificuldade = null
) {
  const params = new URLSearchParams({
    categoria_slug: categoriaSlug
  })

  if (dificuldade) {
    params.set('dificuldade', dificuldade)
  }

  const res = await fetch(
    `${API_URL}/quiz/pergunta?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      },
    }
  )

  const data = await res.json()

  if (!res.ok) {
    throw new Error(
      data.detail || 'Não foi possível gerar a pergunta'
    )
  }

  return data
}


export async function enviarResposta(
  token,
  categoriaSlug,
  acertou,
  usouDica = false
) {
  const res = await fetch(`${API_URL}/quiz/responder`, {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },

    body: JSON.stringify({
      categoria_slug: categoriaSlug,
      acertou,
      usou_dica: usouDica
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(
      data.detail || 'Não foi possível salvar a resposta'
    )
  }

  return data
}


export async function recuperarSenha(email) {
  const res = await fetch(`${API_URL}/recuperar-senha`, {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json'
    },

    body: JSON.stringify({
      email
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(
      data.detail || 'Erro ao solicitar recuperação'
    )
  }

  return data
}


export async function redefinirSenha(
  token,
  novaSenha,
  confirmarNovaSenha
) {
  const res = await fetch(`${API_URL}/redefinir-senha`, {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json'
    },

    body: JSON.stringify({
      token,
      nova_senha: novaSenha,
      confirmar_nova_senha: confirmarNovaSenha
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(
      data.detail || 'Erro ao redefinir a senha'
    )
  }

  return data
}


// =====================================================
// TOKEN
// =====================================================

export function salvarToken(token) {
  sessionStorage.setItem('token', token)
}


export function pegarToken() {
  return sessionStorage.getItem('token')
}


export function logout() {
  sessionStorage.removeItem('token')
}


// =====================================================
// USUÁRIO
// =====================================================

export function iniciais(usuario) {
  if (!usuario) return '?'

  const nome =
    usuario.nome ||
    usuario.username ||
    ''

  const sobrenome =
    usuario.sobrenome ||
    ''

  const primeira =
    nome.charAt(0)

  const segunda =
    sobrenome.charAt(0)

  if (segunda) {
    return (
      primeira + segunda
    ).toUpperCase()
  }

  return primeira.toUpperCase()
}


// =====================================================
// LOJA DE SKINS
// =====================================================

export async function buscarLojaSkins(token) {
  const res = await fetch(
    `${API_URL}/loja/skins`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      },
    }
  )

  const data = await res.json()

  if (!res.ok) {
    throw new Error(
      data.detail ||
      'Não foi possível carregar a loja'
    )
  }

  return data
}


// =====================================================
// COMPRAR SKIN
// =====================================================

export async function comprarSkinPersonagem(
  token,
  skinId
) {
  const res = await fetch(
    `${API_URL}/loja/comprar`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },

      body: JSON.stringify({
        skin_id: skinId
      }),
    }
  )

  const data = await res.json()

  if (!res.ok) {
    throw new Error(
      data.detail ||
      'Não foi possível comprar a skin'
    )
  }

  return data
}


// =====================================================
// EQUIPAR SKIN
// =====================================================

export async function equiparSkinPersonagem(
  token,
  personagemId,
  skinId
) {
  const res = await fetch(
    `${API_URL}/loja/equipar`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },

      body: JSON.stringify({
        personagem_id: personagemId,
        skin_id: skinId
      }),
    }
  )

  const data = await res.json()

  if (!res.ok) {
    throw new Error(
      data.detail ||
      'Não foi possível equipar a skin'
    )
  }

  return data
}


// =====================================================
// DESEQUIPAR SKIN
// =====================================================

export async function desequiparSkinPersonagem(
  token,
  personagemId
) {
  const res = await fetch(
    `${API_URL}/loja/equipar/${personagemId}`,
    {
      method: 'DELETE',

      headers: {
        Authorization: `Bearer ${token}`
      },
    }
  )

  const data = await res.json()

  if (!res.ok) {
    throw new Error(
      data.detail ||
      'Não foi possível desequipar a skin'
    )
  }

  return data
}