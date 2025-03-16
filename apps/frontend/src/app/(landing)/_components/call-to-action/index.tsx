import { Button } from '@kuiiksoft/ui/components';
import Link from 'next/link';
import GradientText from '../../../../components/global/gradient-text';
import { BadgePlus } from '../../../../icons';

const CallToAction = () => {
  return (
    <div className="flex flex-col items-start md:items-center gap-y-5 md:gap-y-0">
      <GradientText
        className="text-[35px] md:text-[40px] lg:text-[55px] xl:text-[70px] 2xl:text-[80px] leading-tight font-semibold"
        element="H1"
      >
        Global Remote <br className="md:hidden" /> Access
      </GradientText>
      <p className="text-sm md:text-center text-left text-muted-foreground">
        Our platform connects users and device owners
        <br className="md:hidden" />
        enabling secure, <br className="hidden md:block" /> collaborative
        control, and monitoring from <br className="md:hidden" />
        anywhere.
      </p>
      <div className="flex md:flex-row flex-col md:justify-center gap-5 md:mt-5 w-full">
        <Button
          variant="outline"
          className="rounded-xl bg-transparent text-base"
        >
          Watch Demo
        </Button>
        <Link href="/sign-in">
          <Button className="rounded-xl text-base flex gap-2 w-full">
            <BadgePlus /> Get Started
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default CallToAction;
