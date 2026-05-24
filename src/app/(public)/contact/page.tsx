"use client"; // <--- Siempre en la línea 1, antes de los imports

import { BlogSection } from '@/presentation/components/contact/HeroContact';
import FormContact from '@/presentation/components/contact/FormContact';
export default function Contact() {
    return (
        <div>
            <BlogSection />
            <FormContact />
        </div>
    );
}