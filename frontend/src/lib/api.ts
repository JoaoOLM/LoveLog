import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function checkLogin(name: String, password: String) {
    const router = useRouter();
    const res = await fetch(`${API_URL}/couples/login/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: name,
            password: password,
        }),
    });

    if (res.ok) {
        const data = await res.json();
        // Armazenar o código do casal
        localStorage.setItem('coupleCode', data.code);
        router.push('/'); // Redirecionar para a página inicial
    } else {
        const data = await res.json();
        throw new Error(data.error || 'Erro desconhecido');
    }
}

async function fetchData(url: String) {
    const coupleCode = localStorage.getItem('coupleCode');

    if (!coupleCode) {
        throw new Error('Usuário não autenticado');
    }

    const res = await fetch(`${API_URL}/${url}/`, {
        method: 'GET',
        headers: {
            'Authorization': `LoveLog ${coupleCode}`,
        },
        cache: "no-store"
    });

    if (!res.ok) throw new Error(`Erro ao buscar em ${url}`);
    return res.json();
}

export async function fetchPhotos() {
    return fetchData('photos');
}

export async function fetchBoard() {
    return fetchData('board')
}

export async function fetchListsWithItems() {
    return fetchData('lists')
}

async function saveData(url: string, content: JSON) {
    const coupleCode = localStorage.getItem('coupleCode');

    if (!coupleCode) {
        throw new Error('Usuário não autenticado');
    }

    const payload = { content };

    const res = await fetch(`${API_URL}/${url}/`, {
        method: 'POST',
        headers: {
            'Authorization': `LoveLog ${coupleCode}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        cache: "no-store"
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Erro ao salvar em ${url}: ${res.status} – ${text}`);
      }
    return res.json();
};

export async function saveBoard(content: JSON) {
    return saveData('board', content);
}

async function deleteData(url: string) {
    const coupleCode = localStorage.getItem('coupleCode');

    if (!coupleCode) {
        throw new Error('Usuário não autenticado');
    }

    await fetch(`${API_URL}/${url}/`, {
        method: 'DELETE',
        headers: {
            'Authorization': `LoveLog ${coupleCode}`,
        },
        cache: "no-store"
    });
};

export async function deleteBoard() {
    deleteData('board');
}