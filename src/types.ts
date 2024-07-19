export interface ICategory {
  id: string;
  title: string;
  image: string;
}

export interface IProduct {
  id: string;
  title: string;
  description?: string;
  image: string;
  sizes?: string[];
  price: number;
  availability: boolean;
}

export interface IApiResponse<T> {
  error?: string;
  details?: string;
  categories?: ICategory[];
  products?: IProduct[];
  product?: IProduct;
}
