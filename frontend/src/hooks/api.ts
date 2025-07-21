export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function createData(url: string, data: any) {
    const res = await fetch(`${API_URL}/${url}`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        cache: "no-store",
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Erro ao criar em ${url}: ${res.status} - ${text}`);
    }

    return res.json();
}

export async function updateData(url: string, content: Record<string, any>) {
    const res = await fetch(`${API_URL}/${url}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(content),
        cache: "no-store"
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Erro ao salvar em ${url}: ${res.status} - ${text}`);
    }

    return res.json();
}

export async function fetchData(url: string) {
    const res = await fetch(`${API_URL}/${url}/`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
        },
        cache: "no-store"
    });

    if (!res.ok) throw new Error(`Erro ao buscar em ${url}`);
    return res.json();
}

export async function deleteData(url: string) {
    const res = await fetch(`${API_URL}/${url}/`, {
        method: 'DELETE',
        headers: {
            "Content-Type": "application/json",
        },
        cache: "no-store"
    });

    if (!res.ok) throw new Error(`Erro ao excluir em ${url}`);
}

export async function uploadFile(url: string, file: File) {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${API_URL}/${url}`, {
        method: 'POST',
        body: formData,
        cache: "no-store",
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Erro ao fazer upload em ${url}: ${res.status} - ${text}`);
    }

    return res.json();
}
