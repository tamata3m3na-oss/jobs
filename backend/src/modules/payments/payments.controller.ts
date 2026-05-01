import {
  Controller,
  Post,
  Headers,
  Req,
  RawBodyRequest,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('webhook')
  @ApiOperation({ summary: 'Stripe webhook handler' })
  async handleWebhook(
    @Headers('stripe-signature') sig: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    if (!sig) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new BadRequestException('Missing raw body');
    }

    try {
      const event = await this.paymentsService.constructEventFromPayload(
        sig,
        rawBody,
      );

      this.logger.log(`Received stripe event: ${event.type}`);

      switch (event.type) {
        case 'checkout.session.completed':
          this.paymentsService.handleCheckoutCompleted(event.data.object as { id: string });
          break;
        case 'customer.subscription.deleted':
          this.paymentsService.handleSubscriptionDeleted(event.data.object as { id: string });
          break;
        default:
          this.logger.warn(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Webhook Error: ${error.message}`);
      throw new BadRequestException(`Webhook Error: ${error.message}`);
    }
  }
}