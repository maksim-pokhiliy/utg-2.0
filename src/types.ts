export interface IProduct {
  id: string;
  title: string;
  image: string;
  sizes?: string[];
  price: number;
  availability: boolean;
}

export interface ICategory {
  id: string;
  title: string;
  image: string;
  products: IProduct[];
}

export interface IApiResponse<T> {
  error?: string;
  details?: string;
  categories?: ICategory[];
  category?: ICategory;
  product?: IProduct;
}
