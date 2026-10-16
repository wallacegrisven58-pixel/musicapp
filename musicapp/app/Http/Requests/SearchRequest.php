<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SearchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // search bisa diakses siapa aja, gak perlu auth
    }

    public function rules(): array
    {
        return [
            'q' => ['required', 'string', 'min:2', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'q.required' => 'Query pencarian tidak boleh kosong.',
            'q.min' => 'Query pencarian minimal 2 karakter.',
        ];
    }
}